import numpy as np
from sklearn.linear_model import LinearRegression

def predict_future_price(historical_prices: list[float], days_ahead: int = 5) -> dict:
    if not historical_prices or len(historical_prices) < 3:
        avg = sum(historical_prices) / len(historical_prices) if historical_prices else 25.0
        return {
            "predicted_price": round(avg, 2),
            "confidence_score": 0.70,
            "trend": "STABLE",
            "expected_min": round(avg * 0.95, 2),
            "expected_max": round(avg * 1.05, 2)
        }
    
    X = np.array(range(len(historical_prices))).reshape(-1, 1)
    y = np.array(historical_prices)
    
    model = LinearRegression()
    model.fit(X, y)
    
    future_day = len(historical_prices) + days_ahead
    predicted_val = float(model.predict([[future_day]])[0])
    
    current_val = historical_prices[-1]
    pct_change = ((predicted_val - current_val) / current_val) * 100 if current_val > 0 else 0
    
    if pct_change > 2.0:
        trend = "INCREASING"
    elif pct_change < -2.0:
        trend = "DECREASING"
    else:
        trend = "STABLE"
        
    confidence = min(0.95, max(0.65, float(model.score(X, y))))
    
    return {
        "predicted_price": round(predicted_val, 2),
        "confidence_score": round(confidence, 2),
        "trend": trend,
        "expected_min": round(predicted_val * 0.94, 2),
        "expected_max": round(predicted_val * 1.06, 2)
    }
