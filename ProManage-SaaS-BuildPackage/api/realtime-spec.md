# Real-Time Events Spec — ProManage SaaS

Protocol: WebSocket (wss://realtime.promanage.sa/ws)  
Auth: Bearer JWT (same token as REST).

## Connection
Client connects with `Authorization: Bearer <token>` header. Server sends heartbeat every 30s.

## Events (Server → Client)
- `project.updated` — { projectId, changes, by, at }
- `task.created` — { task: {...} }
- `task.updated` — { taskId, changes, by, at }
- `task.deleted` — { taskId, by, at }
- `comment.added` — { taskId, comment: {...} }
- `file.uploaded` — { entityType, entityId, file: {...} }

## Events (Client → Server)
- `subscribe` — { channels: ["project:{id}", "org:{id}"] }
- `unsubscribe` — { channels: [...] }
- `typing` — { entityType: "task", entityId, by }

## Payload Envelope
{
  "event": "task.updated",
  "data": { },
  "ts": 1699999999
}

## Reconnect Strategy
Exponential backoff (1s → 30s), resume with last `ts` if supported.
