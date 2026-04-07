from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Mock database of products by category
category_products = {
    "Electronics": ["Samsung 4K Smart TV", "LG OLED TV", "Sony Bravia"],
    "Laptops": ["MacBook Pro", "Dell XPS", "ASUS Vivobook"],
    "Phones": ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8"],
    "Accessories": ["Sony Headphones", "Apple Watch", "Charging Cable"],
    "Gadgets": ["iPad Pro", "GoPro Hero", "Meta Quest 3"]
}

@app.route('/api/recommend', methods=['POST'])
def recommend_products():
    """
    Recommend products based on user's browsing/purchase history and current cart
    """
    try:
        data = request.json
        browsing_history = data.get("browsing_history", [])
        current_category = data.get("category", "Electronics")
        price_range = data.get("price_range", "medium")
        
        recommendations = []
        
        # Get products from similar categories
        if current_category in category_products:
            recommendations = random.sample(category_products[current_category], 
                                           min(3, len(category_products[current_category])))
        
        # Add complementary products
        if current_category in category_products:
            # Suggest accessories if browsing electronics
            if current_category in ["Laptops", "Phones", "Electronics"]:
                recommendations.extend(random.sample(category_products.get("Accessories", []), 
                                                    min(2, len(category_products.get("Accessories", [])))))
        
        return jsonify({
            "recommendations": recommendations,
            "discount_percentage": 15 if price_range == "high" else 10,
            "urgency": "Limited stock available" if random.choice([True, False]) else "In stock"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['POST'])
def user_analytics():
    """
    Analyze user behavior and provide insights
    """
    try:
        data = request.json
        purchase_history = data.get("purchase_history", [])
        browsing_time = data.get("browsing_time", 0)
        
        # Calculate metrics
        avg_order_value = sum([p.get("amount", 0) for p in purchase_history]) / len(purchase_history) if purchase_history else 0
        
        return jsonify({
            "total_purchases": len(purchase_history),
            "avg_order_value": round(avg_order_value, 2),
            "loyalty_score": min(100, len(purchase_history) * 10 + (browsing_time // 3600)),
            "next_recommended_purchase": random.choice(["Laptop", "Headphones", "Phone", "Tablet"])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/price-prediction', methods=['POST'])
def predict_price():
    """
    Predict if price will drop soon based on historical trends
    """
    try:
        data = request.json
        current_price = data.get("price", 0)
        category = data.get("category", "Electronics")
        
        # Mock prediction logic
        trend = random.choice(["up", "down", "stable"])
        predicted_change = random.randint(-20, 15)
        
        return jsonify({
            "current_price": current_price,
            "predicted_price": max(0, current_price + predicted_change),
            "trend": trend,
            "confidence": round(random.uniform(0.6, 0.95), 2),
            "recommendation": "Buy now" if trend == "up" else "Wait for better price"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search-suggestions', methods=['GET'])
def search_suggestions():
    """
    Provide search suggestions based on popular queries
    """
    try:
        query = request.args.get("q", "")
        
        all_products = []
        for products in category_products.values():
            all_products.extend(products)
        
        suggestions = [p for p in all_products if query.lower() in p.lower()]
        suggestions = suggestions[:5]  # Limit to 5
        
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=6000, debug=True)
