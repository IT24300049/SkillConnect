package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.Message;
import com.itp.skilledworker.entity.MessageThread;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.BookingRepository;
import com.itp.skilledworker.repository.MessageRepository;
import com.itp.skilledworker.repository.MessageThreadRepository;
import com.itp.skilledworker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageThreadRepository threadRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public MessageThread createThread(String email, Integer participant2Id, Long bookingId) {
        User participant1 = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User participant2 = userRepository.findById(participant2Id)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        MessageThread thread = new MessageThread();
        thread.setParticipant1(participant1);
        thread.setParticipant2(participant2);
        if (bookingId != null) {
            bookingRepository.findById(bookingId.intValue()).ifPresent(thread::setBooking);
        }

        return threadRepository.save(thread);
    }

    public List<MessageThread> getMyThreads(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return threadRepository.findByParticipant1_UserIdOrParticipant2_UserId(user.getUserId(), user.getUserId());
    }

    public List<Message> getThreadMessages(Integer threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    public List<User> getRecipients(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findByUserIdNotOrderByEmailAsc(user.getUserId());
    }

    @Transactional
    public Message sendMessage(String email, Integer threadId, String text) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        Message message = new Message();
        message.setThreadId(threadId);
        message.setSender(sender);
        message.setMessageText(text);

        message = messageRepository.save(message);

        thread.setLastMessageAt(LocalDateTime.now());
        threadRepository.save(thread);

        return message;
    }

    @Transactional
    public void markRead(Integer messageId) {
        messageRepository.findById(messageId).ifPresent(m -> {
            m.setIsRead(true);
            m.setReadAt(LocalDateTime.now());
            messageRepository.save(m);
        });
    }

    @Transactional
    public void markThreadAsRead(String email, Integer threadId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Message> messages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
        messages.stream()
                .filter(m -> !m.getSender().getUserId().equals(user.getUserId()) && !m.getIsRead())
                .forEach(m -> {
                    m.setIsRead(true);
                    m.setReadAt(LocalDateTime.now());
                });
        messageRepository.saveAll(messages);
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MessageThread> threads = threadRepository.findByParticipant1_UserIdOrParticipant2_UserId(user.getUserId(),
                user.getUserId());

        return threads.stream()
                .flatMap(t -> messageRepository.findByThreadIdOrderByCreatedAtAsc(t.getThreadId()).stream())
                .filter(m -> !m.getSender().getUserId().equals(user.getUserId()) && !m.getIsRead())
                .count();
    }
}
