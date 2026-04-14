package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByUserIdNotOrderByEmailAsc(Integer userId);
}
