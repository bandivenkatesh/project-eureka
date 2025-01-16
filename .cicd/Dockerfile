# Official Eclipse Temurin JRE image as the base image
FROM eclipse-temurin:17-jre-focal

# Define a build-time variable called JAR_SOURCE to specify the location of the JAR file
ARG JAR_SOURCE

# Copy the JAR File 
COPY ${JAR_SOURCE} /app/eureka.jar

# Expose port 8761 to allow external access to application.
EXPOSE 8761

# Set Java options
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Specify the command to run the Spring Based application using the JAVA JAR File
CMD ["java", "-jar", "/app/eureka.jar"]