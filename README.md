# Fox Assistant

You need to create .env file in root folder with the following variables:
```
TELEGRAM_TOKEN=token
VK_TOKEN=token
OPENAI_API_KEY=key
OPEN_AI_MODEL=model

```

Build app
```shell
docker compose build
docker image ls
docker save -o fox-assistant.tar fox-assistant-fox-assistant

docker compose down
docker load -i fox-assistant.tar
docker image ls
docker rmi <hash>
```
