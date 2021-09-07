# Doji_API
Doji startup's back-end take home test.

## How to use
Run this command to build docker image.

```
docker build -t doji-api .
```
Run this command to run docker image.  
First argument after -p is your port, you can change it to 3000:80 or anything in case it doesn't work.

```
docker run -p 80:80 doji-api
```
