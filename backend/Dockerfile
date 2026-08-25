# Multi-stage .NET 10 Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

# Copy solution and project files first for optimized Docker caching
COPY BusinessTwin.slnx ./
COPY src/BusinessTwin.Domain/*.csproj ./src/BusinessTwin.Domain/
COPY src/BusinessTwin.Application/*.csproj ./src/BusinessTwin.Application/
COPY src/BusinessTwin.Infrastructure/*.csproj ./src/BusinessTwin.Infrastructure/
COPY src/BusinessTwin.Api/*.csproj ./src/BusinessTwin.Api/
COPY tests/BusinessTwin.Tests.Unit/*.csproj ./tests/BusinessTwin.Tests.Unit/
COPY tests/BusinessTwin.Tests.Integration/*.csproj ./tests/BusinessTwin.Tests.Integration/

RUN dotnet restore BusinessTwin.slnx

# Copy all source files and publish
COPY . .
WORKDIR /app/src/BusinessTwin.Api
RUN dotnet publish -c Release -o /out --no-restore

# Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000 \
    DOTNET_RUNNING_IN_CONTAINER=true

COPY --from=build /out .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "BusinessTwin.Api.dll"]
