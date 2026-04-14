package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.MessageDtos;
import com.itp.skilledworker.entity.Message;
import com.itp.skilledworker.entity.MessageThread;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/threads")
    public ResponseEntity<ApiResponse<MessageThread>> createThread(
            @RequestBody MessageDtos.CreateThreadRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Thread created",
                    messageService.createThread(auth.getName(), request.getParticipant2Id(), request.getBookingId())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<MessageThread>>> getMyThreads(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("My threads", messageService.getMyThreads(auth.getName())));
    }

    @GetMapping("/recipients")
    public ResponseEntity<ApiResponse<List<User>>> getRecipients(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Recipients", messageService.getRecipients(auth.getName())));
    }

    @GetMapping("/threads/{id}")
    public ResponseEntity<ApiResponse<List<Message>>> getThreadMessages(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Messages", messageService.getThreadMessages(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @Valid @RequestBody MessageDtos.SendMessageRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Message sent",
                    messageService.sendMessage(auth.getName(), request.getThreadId(), request.getMessageText())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        return ResponseEntity
                .ok(ApiResponse.ok("Unread count", Map.of("count", messageService.getUnreadCount(auth.getName()))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(@PathVariable Integer id) {
        messageService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Message marked as read"));
    }

    @PatchMapping("/threads/{id}/read")
    public ResponseEntity<ApiResponse<String>> markThreadAsRead(@PathVariable Integer id, Authentication auth) {
        messageService.markThreadAsRead(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok("Thread marked as read"));
    }
}
