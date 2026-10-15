api : post /api/v1/restaurant/gst-rates
req body:
{
"code": "string",
"name": "string",
"cgst_rate": 0,
"sgst_rate": 0,
"igst_rate": 0,
"total_rate": 0,
"effective_from": "2026-10-15T21:05:10.119Z",
"effective_to": "2026-10-15T21:05:10.119Z"
}

res:
{
"success": true,
"data": {
"id": 0,
"organization_id": 0,
"company_id": 0,
"code": "string",
"name": "string",
"cgst_rate": 0,
"sgst_rate": 0,
"igst_rate": 0,
"total_rate": 0,
"effective_from": "2026-10-15T21:05:10.121Z",
"effective_to": "2026-10-15T21:05:10.121Z",
"is_active": true,
"created_at": "2026-10-15T21:05:10.121Z",
"updated_at": "2026-10-15T21:05:10.121Z"
},
"message": "OK",
"request_id": "string"
}

2. api /api/v1/restaurant/gst-rates
   params:
   code, active_only, page, page_size
   res:
   {
   "success": true,
   "data": {
   "items": [
   {
   "id": 0,
   "organization_id": 0,
   "company_id": 0,
   "code": "string",
   "name": "string",
   "cgst_rate": 0,
   "sgst_rate": 0,
   "igst_rate": 0,
   "total_rate": 0,
   "effective_from": "2026-10-15T21:05:42.517Z",
   "effective_to": "2026-10-15T21:05:42.517Z",
   "is_active": true,
   "created_at": "2026-10-15T21:05:42.517Z",
   "updated_at": "2026-10-15T21:05:42.517Z"
   }
   ],
   "total": 0,
   "page": 1,
   "page_size": 15
   },
   "message": "OK",
   "request_id": "string"
   }

3. get /api/v1/restaurant/gst-rates/{gst_rate_id}
   res:
   {
   "success": true,
   "data": {
   "id": 0,
   "organization_id": 0,
   "company_id": 0,
   "code": "string",
   "name": "string",
   "cgst_rate": 0,
   "sgst_rate": 0,
   "igst_rate": 0,
   "total_rate": 0,
   "effective_from": "2026-10-15T21:06:56.253Z",
   "effective_to": "2026-10-15T21:06:56.253Z",
   "is_active": true,
   "created_at": "2026-10-15T21:06:56.253Z",
   "updated_at": "2026-10-15T21:06:56.253Z"
   },
   "message": "OK",
   "request_id": "string"
   }
