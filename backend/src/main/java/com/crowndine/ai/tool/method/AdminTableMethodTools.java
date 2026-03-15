package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.EmptyTablesRequest;
import com.crowndine.ai.schema.response.EmptyTablesResponse;
import com.crowndine.ai.tool.AIToolNames;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdminTableMethodTools {

    @Tool(name = AIToolNames.EMPTY_TABLES_TOOL,
            description = "Kiểm tra danh sách các bàn còn trống hiện tại của nhà hàng theo khu vực nếu có")
    public EmptyTablesResponse getEmptyTables(EmptyTablesRequest request) {
        System.out.println("== AI đang gọi hàm kiểm tra bàn trống cho khu vực: " + request.area());
        return new EmptyTablesResponse(List.of(
                new EmptyTablesResponse.TableAvailability(101, "Khu vực A", "Trống"),
                new EmptyTablesResponse.TableAvailability(205, "Tầng 2", "Trống")
        ));
    }
}
