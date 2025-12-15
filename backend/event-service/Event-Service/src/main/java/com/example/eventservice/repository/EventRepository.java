package com.example.eventservice.repository;
import com.example.eventservice.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByIsActiveTrue();
    List<Event> findByCategoryAndIsActiveTrue(String category);
    List<Event> findByLocationContainingIgnoreCaseAndIsActiveTrue(String location);

    @Query("SELECT e FROM Event e WHERE e.title LIKE %:keyword% OR e.description LIKE %:keyword% AND e.isActive = true")
    List<Event> searchByKeyword(@Param("keyword") String keyword);

    List<Event> findByDateBetweenAndIsActiveTrue(LocalDateTime start, LocalDateTime end);
}