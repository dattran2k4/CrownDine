package com.crowndine.core.repository;

import com.crowndine.core.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    /**
     * Kiểm tra xem có ca làm việc nào bị trùng thời gian (Overlap) hay không.
     * <p>
     * Logic kiểm tra trùng: (StartA < EndB) và (EndA > StartB).
     * </p>
     *
     * @param startTime Thời gian bắt đầu của ca mới.
     * @param endTime   Thời gian kết thúc của ca mới.
     * @param excludeId ID của ca cần loại trừ (dùng trong trường hợp Update).
     *                  Truyền null nếu là tạo mới (Create).
     * @return true nếu tìm thấy ít nhất 1 ca bị trùng, ngược lại false.
     */
    @Query("""
                SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
                FROM Shift s
                WHERE s.startTime < :endTime
                AND s.endTime > :startTime
                AND (:excludeId IS NULL OR s.id <> :excludeId)
            """)
    boolean existsOverlap(@Param("startTime") LocalTime startTime,
                          @Param("endTime") LocalTime endTime,
                          @Param("excludeId") Long excludeId);
}
