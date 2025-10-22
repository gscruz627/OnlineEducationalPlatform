FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY OnlineEducationaAPI.csproj ./
RUN dotnet restore "OnlineEducationaAPI.csproj"

# copy everything else
COPY . ./
RUN dotnet publish "OnlineEducationaAPI.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "OnlineEducationaAPI.dll"]