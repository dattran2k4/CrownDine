# ----- GIAI ĐOẠN 1: "BUILD" -----
# Sử dụng image JDK 21 (có công cụ build) và đặt tên là "build"
FROM eclipse-temurin:21-jdk AS build

# Đặt thư mục làm việc bên trong container
WORKDIR /workspace

# -- Tối ưu hóa cache của Docker --
# 1. Sao chép các tệp của Maven Wrapper
COPY .mvn/ .mvn
COPY mvnw .

# 2. Sao chép tệp pom.xml
COPY pom.xml .

# [!!!] DÒNG SỬA LỖI: Cấp quyền thực thi cho tệp mvnw
RUN chmod +x ./mvnw

# 3. Chỉ tải các thư viện (dependencies)
# Nếu pom.xml không đổi, Docker sẽ dùng lại lớp cache này ở lần build sau
RUN ./mvnw dependency:go-offline

# 4. Sao chép toàn bộ mã nguồn của bạn
COPY src/ src/

# 5. Build ứng dụng (bỏ qua tests để build nhanh hơn)
# Lệnh này sẽ tạo ra tệp .jar trong /workspace/target/
RUN ./mvnw package -DskipTests

# ----- GIAI ĐOẠN 2: "RUN" -----
# Bắt đầu một image mới, "sạch" chỉ chứa Java JRE 21 (để chạy)
FROM eclipse-temurin:21-jre

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép tệp .jar đã được build từ Giai đoạn 1 (từ "build")
# Lệnh này sẽ tự động tìm tệp .jar trong /workspace/target/
# và đổi tên thành "app.jar" trong image mới.
# KHÔNG CẦN PHẢI THAY ĐỔI TÊN!
COPY --from=build /workspace/target/*.jar app.jar

# Mở cổng 8080 (như bạn đã nói)
EXPOSE 8080

# Lệnh để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]