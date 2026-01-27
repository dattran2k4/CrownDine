package com.crowndine.service.layout;

import com.crowndine.model.Area;
import java.util.List;

public interface AreaService {

    Area create(Area area, Long floorId);

    Area update(Long id, Area area);

    void delete(Long id);

    List<Area> getByFloor(Long floorId);
}
