package com.neurolost;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;

@WebServlet("/api/*")
public class TestServlet extends HttpServlet {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/neurolost";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "I23I02I2006I!";
    private final Gson gson = new Gson();

    @Override
    public void init() throws ServletException {
        super.init();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("MySQL driver loaded successfully!");
        } catch (ClassNotFoundException e) {
            throw new ServletException("Cannot load MySQL driver", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        System.out.println("Received POST request to: " + pathInfo); // Добавляем логирование

        switch (pathInfo) {
            case "/test-results":
                handleSaveResults(request, response);
                break;
            case "/register":
                handleRegistration(request, response);
                break;
            case "/login":
                handleLogin(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        System.out.println("Received GET request to: " + pathInfo); // Добавляем логирование

        switch (pathInfo) {
            case "/test-results":
                handleGetResults(request, response);
                break;
            case "/user-progress":
                handleGetProgress(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void handleRegistration(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            // Чтение данных из запроса
            StringBuilder body = new StringBuilder();
            request.getReader().lines().forEach(body::append);
            System.out.println("Received registration data: " + body.toString()); // Добавляем логирование
            
            Map<String, Object> userData = gson.fromJson(body.toString(), Map.class);

            // Сохранение пользователя в базу данных
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "INSERT INTO users (username, password, role, gender, birth_date) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    stmt.setString(1, userData.get("username").toString());
                    stmt.setString(2, userData.get("password").toString());
                    stmt.setString(3, userData.get("role").toString());
                    stmt.setString(4, userData.get("gender").toString());
                    stmt.setString(5, userData.get("birthDate").toString());
                    
                    int affectedRows = stmt.executeUpdate();
                    if (affectedRows == 0) {
                        throw new SQLException("Creating user failed, no rows affected.");
                    }

                    try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            Map<String, Object> result = new HashMap<>();
                            result.put("id", generatedKeys.getLong(1));
                            result.put("status", "success");
                            
                            response.setContentType("application/json");
                            response.getWriter().write(gson.toJson(result));
                            System.out.println("Registration successful"); // Добавляем логирование
                        } else {
                            throw new SQLException("Creating user failed, no ID obtained.");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage()); // Добавляем логирование
            e.printStackTrace(); // Добавляем стек-трейс для отладки
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            StringBuilder body = new StringBuilder();
            request.getReader().lines().forEach(body::append);
            System.out.println("Received login data: " + body.toString()); // Добавляем логирование
            
            Map<String, Object> loginData = gson.fromJson(body.toString(), Map.class);

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "SELECT id, username, role FROM users WHERE username = ? AND password = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, loginData.get("username").toString());
                    stmt.setString(2, loginData.get("password").toString());
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            request.getSession().setAttribute("userId", rs.getInt("id"));
                            request.getSession().setAttribute("username", rs.getString("username"));
                            request.getSession().setAttribute("role", rs.getString("role"));

                            Map<String, Object> result = new HashMap<>();
                            result.put("id", rs.getInt("id"));
                            result.put("username", rs.getString("username"));
                            result.put("role", rs.getString("role"));
                            
                            response.setContentType("application/json");
                            response.getWriter().write(gson.toJson(result));
                            System.out.println("Login successful"); // Добавляем логирование
                        } else {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Неверное имя пользователя или пароль");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage()); // Добавляем логирование
            e.printStackTrace(); // Добавляем стек-трейс для отладки
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleSaveResults(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            StringBuilder body = new StringBuilder();
            request.getReader().lines().forEach(body::append);
            Map<String, Object> resultData = gson.fromJson(body.toString(), Map.class);

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "INSERT INTO test_results (user_id, test_id, reaction_time, accuracy) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, Integer.parseInt(request.getSession().getAttribute("userId").toString()));
                    stmt.setInt(2, getTestId(resultData.get("testType").toString()));
                    stmt.setDouble(3, (Double) resultData.get("averageReactionTime"));
                    stmt.setDouble(4, (Double) resultData.get("averageAccuracy"));
                    stmt.executeUpdate();
                }
            }

            response.setContentType("application/json");
            response.getWriter().write("{\"status\":\"success\"}");
        } catch (Exception e) {
            System.err.println("Error saving results: " + e.getMessage()); // Добавляем логирование
            e.printStackTrace(); // Добавляем стек-трейс для отладки
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleGetResults(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int userId = Integer.parseInt(request.getParameter("userId"));
            int testId = Integer.parseInt(request.getParameter("testId"));

            List<Map<String, Object>> results = new ArrayList<>();
            
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "SELECT * FROM test_results WHERE user_id = ? AND test_id = ? ORDER BY test_date DESC";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, userId);
                    stmt.setInt(2, testId);
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> result = new HashMap<>();
                            result.put("id", rs.getInt("id"));
                            result.put("reactionTime", rs.getDouble("reaction_time"));
                            result.put("accuracy", rs.getDouble("accuracy"));
                            result.put("testDate", rs.getTimestamp("test_date").toString());
                            results.add(result);
                        }
                    }
                }
            }

            response.setContentType("application/json");
            response.getWriter().write(gson.toJson(results));
        } catch (Exception e) {
            System.err.println("Error getting results: " + e.getMessage()); // Добавляем логирование
            e.printStackTrace(); // Добавляем стек-трейс для отладки
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleGetProgress(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int userId = Integer.parseInt(request.getParameter("userId"));
            
            Map<String, List<Map<String, Object>>> progress = new HashMap<>();
            
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "SELECT t.type, tr.reaction_time, tr.accuracy, tr.test_date " +
                           "FROM test_results tr " +
                           "JOIN tests t ON tr.test_id = t.id " +
                           "WHERE tr.user_id = ? " +
                           "ORDER BY tr.test_date DESC";
                           
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, userId);
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            String testType = rs.getString("type");
                            if (!progress.containsKey(testType)) {
                                progress.put(testType, new ArrayList<>());
                            }
                            
                            Map<String, Object> result = new HashMap<>();
                            result.put("reactionTime", rs.getDouble("reaction_time"));
                            result.put("accuracy", rs.getDouble("accuracy"));
                            result.put("testDate", rs.getTimestamp("test_date").toString());
                            progress.get(testType).add(result);
                        }
                    }
                }
            }

            response.setContentType("application/json");
            response.getWriter().write(gson.toJson(progress));
        } catch (Exception e) {
            System.err.println("Error getting progress: " + e.getMessage()); // Добавляем логирование
            e.printStackTrace(); // Добавляем стек-трейс для отладки
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private int getTestId(String testType) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id FROM tests WHERE type = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, testType);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt("id");
                    }
                    throw new SQLException("Test type not found: " + testType);
                }
            }
        }
    }
} 