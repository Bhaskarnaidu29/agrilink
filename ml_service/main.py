from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import predict_future_price

app = FastAPI(title="AgriLink ML Price Discovery Service", version="1.0.0")

class PredictionRequest(BaseModel):
    crop_name: str
    historical_prices: list[float]
    days_ahead: int = 5

@app.get("/")
def read_root():
    return {"status": "ok", "service": "AgriLink ML Intelligence Engine"}

@app.post("/predict")
def predict_price(req: PredictionRequest):
    if not req.historical_prices:
        raise HTTPException(status_code=400, detail="Historical prices series required")
    
    result = predict_future_price(req.historical_prices, req.days_ahead)
    return {
        "crop_name": req.crop_name,
        "prediction": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
