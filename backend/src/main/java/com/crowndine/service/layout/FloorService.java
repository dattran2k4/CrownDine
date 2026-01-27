package com.crowndine.service.layout;
import com.crowndine.model.Floor;
import java.util.List;

public interface FloorService {

    Floor create(Floor floor);

    Floor update(Long id, Floor floor);

    void delete(Long id);

    Floor getById(Long id);

    List<Floor> getAll();
}

