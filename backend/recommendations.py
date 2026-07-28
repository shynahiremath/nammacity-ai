def get_recommendations(zone: str, congestion: dict, pollution: dict, infra: dict, is_event: bool, weather: str):
    """Rule-based recommendation layer sitting on top of the ML predictions.
    Kept separate from the model layer so traffic authorities can review
    and tune these rules directly without touching the ML pipeline."""

    recs = []

    c_level = congestion["level"]
    p_level = pollution["level"]
    i_level = infra["level"]

    if c_level == "high" and is_event:
        recs.append({
            "priority": "critical",
            "action": "Deploy traffic marshals",
            "reason": f"High congestion at {zone} coinciding with a local event. Manual traffic control significantly reduces gridlock risk during event ingress/egress windows.",
        })

    if c_level == "high" and not is_event:
        recs.append({
            "priority": "high",
            "action": "Activate signal timing diversion",
            "reason": f"Sustained high congestion predicted at {zone}. Adjusting signal cycles or rerouting through adjacent low-load zones can reduce peak load.",
        })

    if c_level == "medium":
        recs.append({
            "priority": "medium",
            "action": "Monitor and prepare contingency route",
            "reason": f"Moderate congestion at {zone}. No immediate action needed, but a diversion route should be pre-identified in case conditions worsen.",
        })

    if weather in ("rain", "heavy_rain") and c_level in ("high", "medium"):
        recs.append({
            "priority": "high" if weather == "heavy_rain" else "medium",
            "action": "Issue public weather-traffic advisory",
            "reason": f"{weather.replace('_', ' ').title()} combined with elevated congestion increases accident risk at {zone}. Recommend public advisory via app/SMS.",
        })

    if p_level == "high":
        recs.append({
            "priority": "medium",
            "action": "Flag for air quality advisory",
            "reason": f"High pollution levels predicted at {zone}. Consider public health advisory for sensitive groups in the area.",
        })

    if i_level == "high":
        recs.append({
            "priority": "medium",
            "action": "Schedule infrastructure inspection",
            "reason": f"Sustained high load is accelerating wear at {zone}. Recommend proactive inspection to catch road damage before it worsens congestion further.",
        })

    if not recs:
        recs.append({
            "priority": "low",
            "action": "No action needed",
            "reason": f"Conditions at {zone} are within normal range.",
        })

    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    recs.sort(key=lambda r: priority_order[r["priority"]])

    return recs