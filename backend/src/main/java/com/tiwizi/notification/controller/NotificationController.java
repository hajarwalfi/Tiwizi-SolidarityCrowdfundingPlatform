package com.tiwizi.notification.controller;

import com.tiwizi.entity.User;
import com.tiwizi.notification.dto.NotificationResponse;
import com.tiwizi.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal User currentUser) {
        log.info("GET /api/notifications - user: {}", currentUser.getEmail());
        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal User currentUser) {
        log.info("GET /api/notifications/unread - user: {}", currentUser.getEmail());
        return ResponseEntity.ok(notificationService.getUnreadNotifications(currentUser.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        log.info("PATCH /api/notifications/{}/read - user: {}", id, currentUser.getEmail());
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal User currentUser) {
        log.info("PATCH /api/notifications/read-all - user: {}", currentUser.getEmail());
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal User currentUser) {
        log.info("DELETE /api/notifications - user: {}", currentUser.getEmail());
        notificationService.deleteAllNotifications(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
