package com.itp.skilledworker.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class MessageDtos {

    @Data
    public static class CreateThreadRequest {
        private Integer participant2Id;
        private Long bookingId;
    }

    @Data
    public static class SendMessageRequest {
        private Integer threadId;
        private String messageText;
    }
}
