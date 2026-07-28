import random

OPENERS = {
    "critical": [
        "Immediate attention is required at {zone}.",
        "{zone} is currently facing a critical situation.",
        "Conditions at {zone} demand urgent intervention.",
    ],
    "high": [
        "{zone} is experiencing elevated risk levels.",
        "Conditions at {zone} warrant close monitoring today.",
        "{zone} shows significant strain across key indicators.",
    ],
    "medium": [
        "{zone} is showing moderate signs of stress.",
        "Conditions at {zone} are manageable but worth watching.",
    ],
    "low": [
        "{zone} is operating within normal parameters.",
        "Conditions at {zone} remain stable.",
    ],
}

FACTOR_PHRASES = {
    "Zone": "the location's typical traffic profile",
    "Time of day": "the current time of day",
    "Day of week": "the day of the week",
    "Weekday/weekend": "whether it's a weekday or weekend",
    "Rush hour": "rush hour timing",
    "Weather": "current weather conditions",
    "Local event": "a nearby scheduled event",
}


def _overall_severity(congestion, pollution, infra, is_event):
    levels = [congestion["level"], pollution["level"], infra["level"]]
    if is_event and congestion["level"] == "high":
        return "critical"
    if levels.count("high") >= 2:
        return "high"
    if "high" in levels or levels.count("medium") >= 2:
        return "medium"
    return "low"


def generate_summary(zone, congestion, pollution, infra, weather, is_event, recommendations):
    severity = _overall_severity(congestion, pollution, infra, is_event)
    opener = random.choice(OPENERS[severity]).format(zone=zone)

    metric_sentences = []
    metric_sentences.append(
        f"Congestion is predicted to be {congestion['level']} "
        f"({congestion['confidence']*100:.0f}% model confidence)."
    )
    metric_sentences.append(
        f"Pollution levels are trending {pollution['level']}."
    )
    metric_sentences.append(
        f"Infrastructure stress is currently assessed as {infra['level']}."
    )

    top_reason = congestion["reasons"][0] if congestion["reasons"] else None
    driver_sentence = ""
    if top_reason:
        factor_phrase = FACTOR_PHRASES.get(top_reason["factor"], top_reason["factor"].lower())
        driver_sentence = f" The primary driver appears to be {factor_phrase}."
        if top_reason.get("note"):
            driver_sentence += f" {top_reason['note']}"

    weather_sentence = ""
    if weather in ("rain", "heavy_rain"):
        weather_sentence = (
            f" {weather.replace('_', ' ').title()} conditions are compounding these effects, "
            f"increasing both congestion risk and driver caution requirements."
        )

    event_sentence = ""
    if is_event:
        event_sentence = (
            " A local event is scheduled nearby, which historically produces sharp, "
            "short-duration spikes not fully captured by baseline traffic patterns."
        )

    action_sentence = ""
    if recommendations:
        top_action = recommendations[0]
        action_sentence = (
            f" Recommended next step: {top_action['action'].lower()} "
            f"(priority: {top_action['priority']})."
        )

    summary = (
        f"{opener} {' '.join(metric_sentences)}{driver_sentence}"
        f"{weather_sentence}{event_sentence}{action_sentence}"
    )

    return {
        "severity": severity,
        "summary": summary,
    }