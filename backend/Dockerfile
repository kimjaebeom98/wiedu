# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src
RUN gradle build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Set production profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
