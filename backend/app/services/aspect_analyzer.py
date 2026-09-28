"""
backend/app/services/aspect_analyzer.py

Aspect-Based Hotel Review Sentiment Analysis Service.
Performs fine-grained multi-aspect extraction, sentiment classification,
verbatim evidence phrase extraction, and hotel management insight generation.
"""
import re
from typing import List, Dict, Any, Optional

# Sentiment polarity lexicons
NEGATIONS = {
    "not", "never", "no", "wasn't", "isnt", "isn't", "aren't", "arent",
    "didn't", "didnt", "hardly", "barely", "scarcely", "without", "rarely",
    "cannot", "cant", "can't", "couldn't", "couldnt", "neither", "nor"
}

POSITIVE_WORDS = {
    "delicious", "tasty", "better", "best", "good", "great", "excellent",
    "clean", "spotless", "comfortable", "cozy", "spacious", "friendly",
    "helpful", "polite", "courteous", "smooth", "prompt", "fast", "quick",
    "responsive", "satisfied", "liked", "loved", "enjoyed", "wonderful",
    "amazing", "fantastic", "pleasant", "nice", "well", "fine", "fresh",
    "accurate", "correct", "perfect", "worth", "affordable", "reasonable",
    "welcoming", "attentive", "impeccable", "convenient", "accessible", "quiet",
    "peaceful", "flavorful", "superb", "exceptional", "efficient"
}

NEGATIVE_WORDS = {
    "rude", "impolite", "unfriendly", "disrespectful", "arrogant", "dirty",
    "filthy", "dusty", "smelly", "uncomfortable", "cramped", "noisy", "loud",
    "cold", "stale", "undercooked", "overcooked", "bland", "flavorless",
    "poor", "bad", "terrible", "horrible", "awful", "slow", "delayed", "late",
    "delay", "dissatisfied", "dislike", "disliked", "hate", "hated", "worst",
    "expensive", "overpriced", "broken", "unresponsive", "fail", "failed",
    "unhelpful", "sluggish", "problem", "issues", "small", "dark", "dated"
}

# Special positive compound phrases
SPECIAL_POSITIVE_PHRASES = [
    "without fail",
    "got at the time",
    "at the time",
    "on time",
    "in time",
    "felt better",
    "responded very well",
    "responded well",
    "very well",
    "very helpful",
    "very friendly",
    "smooth",
    "what i ordered without fail",
    "got what i ordered",
    "value for money",
    "worth every penny",
    "worth the money",
]

# Special negative compound phrases
SPECIAL_NEGATIVE_PHRASES = [
    "not satisfied",
    "not liked",
    "is not satisfied",
    "are not satisfied",
    "not good",
    "not clean",
    "not comfortable",
    "not helpful",
    "not friendly",
    "took too long",
    "too long",
    "was rude",
    "is rude",
    "not worth",
    "failed to",
    "out of order",
    "did not like",
    "didn't like",
]

# Comprehensive catalog of hotel aspects
ASPECT_CATALOG = [
    {
        "aspect": "Server Attitude",
        "priority": 100,
        "patterns": [
            r"\bserver\s+attitude\b",
            r"\bserver['’]?s\s+attitude\b",
            r"\bwaiter\s+attitude\b",
            r"\bserver\s+(?:was|is|seemed|attitude\s+is)\s+(?:very\s+)?(?:rude|impolite|unfriendly|disrespectful|arrogant|unprofessional|friendly|polite|courteous|nice|not\s+liked)\b",
            r"\bthe\s+server\s+was\s+rude\b",
            r"\bserver\s+attitude\s+is\s+not\s+liked\b",
        ],
        "keywords": ["server attitude", "waiter attitude"],
        "context_terms": ["server", "waiter"],
        "sentiment_triggers": ["attitude", "rude", "impolite", "arrogant", "disrespectful", "friendly", "polite", "courteous", "manners", "not liked"],
        "positive_feedback": "The server displayed a polite and welcoming attitude.",
        "negative_feedback": "The customer disliked the server's attitude.",
        "management_positive": "courteous server attitude",
        "management_negative": "server attitude and staff demeanor",
    },
    {
        "aspect": "Server Service",
        "priority": 95,
        "patterns": [
            r"\bservice\s+(?:provided\s+by\s+the\s+server|by\s+the\s+server|of\s+the\s+server)\b",
            r"\bserver\s+service\b",
            r"\bserver\s+(?:was|is)\s+(?:not\s+)?(?:attentive|slow|responsive|helpful|satisfied)\b",
            r"\bserver\s+(?:also\s+)?took\s+too\s+long\b",
            r"\bservice\s+(?:provided\s+by\s+the\s+server|by\s+the\s+server)\s+is\s+not\s+satisfied\b",
        ],
        "keywords": ["service provided by the server", "service by the server", "server service"],
        "context_terms": ["server", "waiter"],
        "sentiment_triggers": ["service", "served", "attentive", "not satisfied", "satisfied"],
        "positive_feedback": "The server provided attentive and helpful service.",
        "negative_feedback": "The customer was dissatisfied with the server's service.",
        "management_positive": "attentive server service",
        "management_negative": "server service quality",
    },
    {
        "aspect": "Order Accuracy",
        "priority": 90,
        "patterns": [
            r"\b(?:got|received)\s+what\s+(?:i|we)\s+ordered\b",
            r"\bwhat\s+(?:i|we)\s+ordered\s+without\s+fail\b",
            r"\border\s+accuracy\b",
            r"\bcorrect\s+order\b",
            r"\bwrong\s+order\b",
            r"\bincorrect\s+order\b",
            r"\baccurate\s+order\b",
            r"\bwhat\s+i\s+ordered\b",
        ],
        "keywords": ["ordered without fail", "what i ordered", "correct order", "order accuracy"],
        "context_terms": ["ordered", "order"],
        "sentiment_triggers": ["without fail", "correct", "accurate", "wrong", "missing"],
        "positive_feedback": "The customer received the correct order.",
        "negative_feedback": "Order accuracy issues or incorrect items were received.",
        "management_positive": "order accuracy",
        "management_negative": "order fulfillment accuracy",
    },
    {
        "aspect": "Timeliness",
        "priority": 88,
        "patterns": [
            r"\bgot\s+at\s+the\s+time\b",
            r"\bat\s+the\s+time\b",
            r"\bon\s+time\b",
            r"\bin\s+time\b",
            r"\btimely\b",
            r"\btimeliness\b",
            r"\bprompt\s+delivery\b",
            r"\barrived\s+promptly\b",
        ],
        "keywords": ["at the time", "got at the time", "on time", "timely", "timeliness"],
        "context_terms": ["time", "timely", "prompt"],
        "sentiment_triggers": ["at the time", "on time", "prompt", "timely"],
        "positive_feedback": "The order arrived on time.",
        "negative_feedback": "Delays were experienced in service and order timing.",
        "management_positive": "timely service",
        "management_negative": "service timing and order delivery speeds",
    },
    {
        "aspect": "Room Service",
        "priority": 85,
        "patterns": [
            r"\broom\s+service\b",
            r"\bin-?room\s+dining\b",
        ],
        "keywords": ["room service", "in-room dining"],
        "context_terms": ["room service"],
        "sentiment_triggers": ["prompt", "hot", "quick", "slow", "cold", "late"],
        "positive_feedback": "Room service was prompt and well presented.",
        "negative_feedback": "Room service delivery was slow or deficient.",
        "management_positive": "room service efficiency",
        "management_negative": "room service delivery speed and quality",
    },
    {
        "aspect": "Receptionist",
        "priority": 82,
        "patterns": [
            r"\breceptionist\b",
            r"\bfront\s+desk\s+(?:clerk|staff|receptionist)\b",
            r"\breception\s+desk\b",
        ],
        "keywords": ["receptionist", "front desk clerk", "reception desk"],
        "context_terms": ["receptionist", "front desk"],
        "sentiment_triggers": ["responded very well", "responded well", "helpful", "friendly", "welcoming", "rude"],
        "positive_feedback": "The receptionist responded well.",
        "negative_feedback": "The receptionist was unhelpful or unresponsive.",
        "management_positive": "receptionist responsiveness",
        "management_negative": "front desk and receptionist responsiveness",
    },
    {
        "aspect": "Staff Behaviour",
        "priority": 80,
        "patterns": [
            r"\bstaff\s+behaviou?r\b",
            r"\bbehaviou?r\s+of\s+(?:the\s+)?staff\b",
            r"\bstaff\s+attitude\b",
        ],
        "keywords": ["staff behaviour", "staff behavior", "staff attitude"],
        "context_terms": ["staff", "behaviour", "behavior"],
        "sentiment_triggers": ["polite", "impolite", "professional", "rude", "friendly"],
        "positive_feedback": "Hotel staff behavior was professional and polite.",
        "negative_feedback": "Staff behavior was unprofessional or discourteous.",
        "management_positive": "professional staff behavior",
        "management_negative": "staff hospitality conduct and professional etiquette",
    },
    {
        "aspect": "Check-in",
        "priority": 78,
        "patterns": [
            r"\bcheck-?in\b",
            r"\bchecking\s+in\b",
            r"\barrival\s+process\b",
        ],
        "keywords": ["check-in", "checkin", "checking in"],
        "context_terms": ["check-in", "checkin"],
        "sentiment_triggers": ["smooth", "quick", "easy", "slow", "delayed"],
        "positive_feedback": "Check-in was smooth and efficient.",
        "negative_feedback": "Check-in was slow or encountered difficulties.",
        "management_positive": "smooth check-in process",
        "management_negative": "streamlining the check-in process",
    },
    {
        "aspect": "Check-out",
        "priority": 78,
        "patterns": [
            r"\bcheck-?out\b",
            r"\bchecking\s+out\b",
            r"\bdeparture\s+process\b",
        ],
        "keywords": ["check-out", "checkout", "checking out"],
        "context_terms": ["check-out", "checkout"],
        "sentiment_triggers": ["smooth", "quick", "easy", "slow", "delayed"],
        "positive_feedback": "Check-out was quick and hassle-free.",
        "negative_feedback": "Check-out process was delayed or problematic.",
        "management_positive": "seamless check-out experience",
        "management_negative": "streamlining departure procedures",
    },
    {
        "aspect": "Food Taste",
        "priority": 75,
        "patterns": [
            r"\bfood\s+taste\b",
            r"\btaste\s+of\s+(?:the\s+)?food\b",
            r"\bfelt\s+better\s+in\s+the\s+food\s+taste\b",
            r"\btasty\b",
            r"\bflavor\b",
            r"\bflavour\b",
            r"\bfood\s+was\s+(?:very\s+)?delicious\b",
            r"\bthe\s+food\s+was\s+delicious\b",
            r"\bdelicious\s+food\b",
        ],
        "keywords": ["food taste", "taste", "delicious", "tasty", "flavor"],
        "context_terms": ["food", "taste", "delicious"],
        "sentiment_triggers": ["better", "delicious", "tasty", "bland", "flavorless"],
        "positive_feedback": "Food taste was satisfactory.",
        "negative_feedback": "The food taste was unsatisfactory or lacked flavor.",
        "management_positive": "food quality and taste",
        "management_negative": "food flavor and taste consistency",
    },
    {
        "aspect": "Food Variety",
        "priority": 73,
        "patterns": [
            r"\bfood\s+variety\b",
            r"\bvariety\s+of\s+(?:the\s+)?food\b",
            r"\bbuffet\s+spread\b",
            r"\bmenu\s+options\b",
            r"\bbreakfast\s+options\b",
        ],
        "keywords": ["food variety", "variety", "menu options", "buffet"],
        "context_terms": ["variety", "buffet", "options"],
        "sentiment_triggers": ["extensive", "limited", "wide", "few", "varied"],
        "positive_feedback": "There was a broad and pleasing variety of food options.",
        "negative_feedback": "Food variety was limited or lacked choices.",
        "management_positive": "diverse food variety",
        "management_negative": "expanding dining menu choices and breakfast varieties",
    },
    {
        "aspect": "Food Quality",
        "priority": 70,
        "patterns": [
            r"\bfood\s+quality\b",
            r"\bquality\s+of\s+(?:the\s+)?food\b",
            r"\bfood\s+was\s+(?:cold|stale|undercooked|overcooked|fresh|good|great|poor|terrible|bad)\b",
            r"\bcold\s+food\b",
            r"\bthe\s+food\s+was\s+cold\b",
            r"\bthe\s+food\s+was\s+good\b",
            r"\bfood\b",
            r"\bbreakfast\b",
            r"\bdinner\b",
            r"\blunch\b",
            r"\bmeal\b",
        ],
        "keywords": ["food", "breakfast", "dinner", "lunch", "meal"],
        "context_terms": ["food", "meal"],
        "sentiment_triggers": ["cold", "fresh", "good", "poor", "stale", "delicious"],
        "positive_feedback": "Food was high quality and well prepared.",
        "negative_feedback": "The customer was disappointed with food temperature or quality.",
        "management_positive": "food preparation and quality",
        "management_negative": "food temperature and culinary quality",
    },
    {
        "aspect": "Room Cleanliness",
        "priority": 68,
        "patterns": [
            r"\broom\s+was\s+(?:very\s+)?clean\b",
            r"\bthe\s+room\s+was\s+clean\b",
            r"\broom\s+was\s+(?:very\s+)?dirty\b",
            r"\bthe\s+room\s+was\s+dirty\b",
            r"\bclean\s+room\b",
            r"\bdirty\s+room\b",
            r"\broom\s+cleanliness\b",
            r"\bspotless\s+room\b",
            r"\bfilthy\s+room\b",
            r"\bdusty\s+room\b",
        ],
        "keywords": ["clean", "dirty", "cleanliness", "spotless", "filthy"],
        "context_terms": ["room", "cleanliness"],
        "sentiment_triggers": ["clean", "dirty", "spotless", "filthy", "dusty"],
        "positive_feedback": "Room cleanliness was well maintained.",
        "negative_feedback": "The room had cleanliness issues and was dirty.",
        "management_positive": "spotless room cleanliness",
        "management_negative": "housekeeping diligence and room cleanliness",
    },
    {
        "aspect": "Room Comfort",
        "priority": 65,
        "patterns": [
            r"\broom\s+was\s+(?:very\s+)?comfortable\b",
            r"\bthe\s+room\s+was\s+comfortable\b",
            r"\broom\s+was\s+(?:very\s+)?uncomfortable\b",
            r"\bcomfortable\s+room\b",
            r"\buncomfortable\s+room\b",
            r"\broom\s+comfort\b",
            r"\bcomfortable\b",
            r"\buncomfortable\b",
            r"\bcozy\b",
            r"\bspacious\b",
            r"\bcramped\b",
            r"\bnoisy\s+room\b",
            r"\bquiet\s+room\b",
        ],
        "keywords": ["comfortable", "uncomfortable", "comfort", "cozy", "spacious"],
        "context_terms": ["room", "comfort"],
        "sentiment_triggers": ["comfortable", "uncomfortable", "cozy", "cramped", "noisy"],
        "positive_feedback": "The room provided a comfortable and pleasant stay.",
        "negative_feedback": "The room was uncomfortable or inconvenient.",
        "management_positive": "room comfort and ambiance",
        "management_negative": "room comfort and soundproofing",
    },
    {
        "aspect": "Hotel Cleanliness",
        "priority": 63,
        "patterns": [
            r"\bhotel\s+cleanliness\b",
            r"\bclean\s+hotel\b",
            r"\bdirty\s+hotel\b",
            r"\bproperty\s+(?:was\s+)?clean\b",
            r"\blobby\s+(?:was\s+)?clean\b",
        ],
        "keywords": ["clean hotel", "dirty hotel", "hotel cleanliness"],
        "context_terms": ["hotel", "property", "lobby"],
        "sentiment_triggers": ["clean", "dirty", "spotless"],
        "positive_feedback": "Hotel common areas were exceptionally clean.",
        "negative_feedback": "Hotel common spaces had cleanliness deficiencies.",
        "management_positive": "hotel property cleanliness",
        "management_negative": "deep cleaning of general hotel common areas",
    },
    {
        "aspect": "Bed",
        "priority": 62,
        "patterns": [
            r"\bbed\b",
            r"\bmattress\b",
            r"\bpillow(?:s)?\b",
            r"\blinens?\b",
            r"\bsheets?\b",
        ],
        "keywords": ["bed", "mattress", "pillow", "pillows"],
        "context_terms": ["bed", "mattress"],
        "sentiment_triggers": ["comfortable", "soft", "hard", "uncomfortable"],
        "positive_feedback": "Bed and bedding were comfortable and restful.",
        "negative_feedback": "Bed or mattress was uncomfortable.",
        "management_positive": "comfortable bedding",
        "management_negative": "bedding quality and mattress comfort",
    },
    {
        "aspect": "Bathroom",
        "priority": 61,
        "patterns": [
            r"\bbathroom\b",
            r"\bshower\b",
            r"\btoilet\b",
            r"\bhot\s+water\b",
            r"\bbathtubs?\b",
            r"\btowels?\b",
        ],
        "keywords": ["bathroom", "shower", "toilet", "hot water"],
        "context_terms": ["bathroom", "shower"],
        "sentiment_triggers": ["clean", "hot", "dirty", "small", "clogged"],
        "positive_feedback": "Bathroom facilities were clean and fully functional.",
        "negative_feedback": "Bathroom had plumbing, hot water, or hygiene issues.",
        "management_positive": "modern bathroom amenities",
        "management_negative": "bathroom plumbing, water pressure, and sanitization",
    },
    {
        "aspect": "Waiting Time",
        "priority": 58,
        "patterns": [
            r"\btook\s+too\s+long\s+to\s+respond\b",
            r"\btook\s+too\s+long\b",
            r"\bwaiting\s+time\b",
            r"\bwaited\s+too\s+long\b",
            r"\blong\s+wait\b",
            r"\bdelay(?:ed)?\b",
        ],
        "keywords": ["took too long", "waiting time", "waited too long", "long wait"],
        "context_terms": ["time", "wait", "long"],
        "sentiment_triggers": ["too long", "delayed", "slow", "fast", "prompt"],
        "positive_feedback": "Response time was prompt with minimal waiting.",
        "negative_feedback": "The customer experienced lengthy wait times and delays.",
        "management_positive": "prompt response times",
        "management_negative": "staff response time and speed of service",
    },
    {
        "aspect": "Wi-Fi",
        "priority": 55,
        "patterns": [
            r"\bthe\s+wi-?fi\s+was\s+poor\b",
            r"\bwi-?fi\s+was\s+(?:good|great|poor|slow|fast|bad)\b",
            r"\bwi-?fi\b",
            r"\binternet\b",
            r"\bnetwork\b",
        ],
        "keywords": ["wi-fi", "wifi", "internet"],
        "context_terms": ["wifi", "wi-fi", "internet"],
        "sentiment_triggers": ["poor", "slow", "fast", "reliable", "unreliable", "good"],
        "positive_feedback": "Wi-Fi connectivity was fast and dependable.",
        "negative_feedback": "The Wi-Fi connectivity was poor or slow.",
        "management_positive": "reliable Wi-Fi connectivity",
        "management_negative": "Wi-Fi speed, stability, and signal range",
    },
    {
        "aspect": "Parking",
        "priority": 54,
        "patterns": [
            r"\bparking\b",
            r"\bvalet\b",
            r"\bgarage\b",
        ],
        "keywords": ["parking", "valet", "garage"],
        "context_terms": ["parking", "valet"],
        "sentiment_triggers": ["easy", "ample", "difficult", "expensive", "secure"],
        "positive_feedback": "Parking was convenient and accessible.",
        "negative_feedback": "Parking was difficult, restricted, or overpriced.",
        "management_positive": "convenient parking amenities",
        "management_negative": "parking availability and valet management",
    },
    {
        "aspect": "Value for Money",
        "priority": 52,
        "patterns": [
            r"\bvalue\s+for\s+money\b",
            r"\bworth\s+(?:the\s+)?money\b",
            r"\bworth\s+it\b",
            r"\bnot\s+worth\s+it\b",
        ],
        "keywords": ["value for money", "worth it"],
        "context_terms": ["value", "money"],
        "sentiment_triggers": ["worth it", "not worth", "great value", "poor value"],
        "positive_feedback": "The stay represented great value for money.",
        "negative_feedback": "The stay was considered poor value for the cost.",
        "management_positive": "strong guest value proposition",
        "management_negative": "perceived price-to-value proposition",
    },
    {
        "aspect": "Price",
        "priority": 50,
        "patterns": [
            r"\bprice\b",
            r"\brates?\b",
            r"\bexpensive\b",
            r"\boverpriced\b",
            r"\bcost\b",
            r"\baffordable\b",
        ],
        "keywords": ["price", "expensive", "affordable", "cost"],
        "context_terms": ["price", "cost"],
        "sentiment_triggers": ["expensive", "affordable", "high", "reasonable"],
        "positive_feedback": "Room rates were reasonable and competitive.",
        "negative_feedback": "Pricing was perceived as expensive or inflated.",
        "management_positive": "competitive pricing",
        "management_negative": "pricing and tariff positioning",
    },
    {
        "aspect": "Amenities",
        "priority": 48,
        "patterns": [
            r"\bamenities\b",
            r"\btoiletries\b",
            r"\bkettle\b",
            r"\bfridge\b",
            r"\bcoffee\s+maker\b",
        ],
        "keywords": ["amenities", "toiletries"],
        "context_terms": ["amenities"],
        "sentiment_triggers": ["generous", "lacking", "quality", "missing"],
        "positive_feedback": "In-room amenities were thoughtful and complete.",
        "negative_feedback": "In-room amenities were lacking or missing.",
        "management_positive": "comprehensive guest amenities",
        "management_negative": "in-room amenities replenishment and availability",
    },
    {
        "aspect": "Facilities",
        "priority": 46,
        "patterns": [
            r"\bfacilities\b",
            r"\bgym\b",
            r"\bpool\b",
            r"\bswimming\s+pool\b",
            r"\bspa\b",
            r"\belevator\b",
            r"\blift\b",
        ],
        "keywords": ["facilities", "gym", "pool", "spa", "elevator"],
        "context_terms": ["facilities", "gym", "pool"],
        "sentiment_triggers": ["clean", "modern", "closed", "broken", "dirty"],
        "positive_feedback": "Hotel facilities were modern and well maintained.",
        "negative_feedback": "Facilities were out of order, crowded, or unkempt.",
        "management_positive": "well-maintained recreational facilities",
        "management_negative": "facility maintenance and operational availability",
    },
    {
        "aspect": "Location",
        "priority": 44,
        "patterns": [
            r"\blocation\b",
            r"\bclose\s+to\b",
            r"\bnear\s+(?:the\s+)?\w+\b",
            r"\bcentral\s+location\b",
            r"\bconveniently\s+located\b",
        ],
        "keywords": ["location", "close to", "central"],
        "context_terms": ["location"],
        "sentiment_triggers": ["convenient", "central", "far", "walkable", "accessible"],
        "positive_feedback": "Hotel location was convenient and accessible.",
        "negative_feedback": "Hotel location was inconvenient or difficult to reach.",
        "management_positive": "prime accessible hotel location",
        "management_negative": "guest local transit guidance and transportation options",
    },
    {
        "aspect": "Staff",
        "priority": 40,
        "patterns": [
            r"\bthe\s+staff\s+were\s+(?:very\s+)?friendly\b",
            r"\bstaff\s+were\s+(?:very\s+)?friendly\b",
            r"\bstaff\s+was\s+(?:very\s+)?friendly\b",
            r"\bstaff\s+were\s+helpful\b",
            r"\bstaff\b",
            r"\bemployees\b",
        ],
        "keywords": ["staff", "employees"],
        "context_terms": ["staff"],
        "sentiment_triggers": ["friendly", "helpful", "polite", "rude", "unfriendly"],
        "positive_feedback": "The hotel staff were friendly and accommodating.",
        "negative_feedback": "The staff were discourteous or unhelpful.",
        "management_positive": "friendly and attentive staff",
        "management_negative": "staff hospitality and customer service training",
    },
    {
        "aspect": "Service",
        "priority": 38,
        "patterns": [
            r"\boverall\s+service\b",
            r"\bcustomer\s+service\b",
            r"\bhospitality\b",
            r"\bservice\b",
        ],
        "keywords": ["service", "hospitality", "customer service"],
        "context_terms": ["service"],
        "sentiment_triggers": ["excellent", "good", "poor", "slow", "attentive"],
        "positive_feedback": "Customer service standards were high and responsive.",
        "negative_feedback": "Customer service was deficient or slow.",
        "management_positive": "high customer service standards",
        "management_negative": "overall service workflow and responsiveness",
    },
    {
        "aspect": "Room",
        "priority": 35,
        "patterns": [
            r"\bthe\s+room\s+was\s+excellent\b",
            r"\bthe\s+room\s+was\s+great\b",
            r"\bthe\s+room\s+was\s+poor\b",
            r"\bthe\s+room\s+was\s+terrible\b",
            r"\bthe\s+room\b",
            r"\bour\s+room\b",
            r"\bhotel\s+room\b",
        ],
        "keywords": ["the room", "our room", "room"],
        "context_terms": ["room"],
        "sentiment_triggers": ["excellent", "great", "good", "poor", "bad", "terrible"],
        "positive_feedback": "Room accommodations were excellent.",
        "negative_feedback": "Room accommodations failed to meet expectations.",
        "management_positive": "high quality room accommodations",
        "management_negative": "room accommodation standards",
    },
    {
        "aspect": "Overall Experience",
        "priority": 30,
        "patterns": [
            r"\boverall\s+experience\b",
            r"\bour\s+stay\b",
            r"\bthe\s+stay\b",
            r"\boverall\s+stay\b",
        ],
        "keywords": ["overall experience", "stay", "visit"],
        "context_terms": ["stay", "experience"],
        "sentiment_triggers": ["enjoyable", "pleasant", "terrible", "disappointing"],
        "positive_feedback": "The overall guest experience was highly positive.",
        "negative_feedback": "The overall stay was unsatisfactory.",
        "management_positive": "delivering satisfying guest stays",
        "management_negative": "holistic guest journey and satisfaction",
    },
]


def split_into_clauses(text: str) -> List[str]:
    """
    Splits text into cohesive clauses using punctuation and coordinating conjunctions.
    Preserves original phrasing.
    """
    split_pattern = (
        r'(?<=[.,;!?])\s+'
        r'|\s+(?:but|however|although|yet|while|though|whereas)\s+'
        r'|\s+and\s+(?=(?:the|i|we|my|our|got|was|were|check|wi-?fi|food|room|staff|service)\b)'
    )
    raw_segments = re.split(split_pattern, text, flags=re.IGNORECASE)
    
    clauses = []
    for seg in raw_segments:
        s = seg.strip(" \t\r\n.,;!?")
        if not s:
            continue
        # Also split on comma-separated list of predicates like "clean, comfortable"
        sub_parts = re.split(r',\s*', s)
        if len(sub_parts) > 1:
            for p in sub_parts:
                p_clean = p.strip()
                if p_clean:
                    clauses.append(p_clean)
        else:
            clauses.append(s)
            
    return clauses


def evaluate_clause_sentiment(clause: str, aspect_info: Dict[str, Any]) -> str:
    """
    Determines sentiment polarity (Positive, Negative, Neutral) for an aspect in a clause.
    Carefully evaluates negation and compound phrases.
    """
    lower = clause.lower().strip()
    
    # 1. Check special negative compound phrases
    for neg_phrase in SPECIAL_NEGATIVE_PHRASES:
        if neg_phrase in lower:
            return "Negative"
            
    # 2. Check special positive compound phrases
    for pos_phrase in SPECIAL_POSITIVE_PHRASES:
        if pos_phrase in lower:
            return "Positive"
            
    words = re.findall(r'\b[a-zA-Z\'-]+\b', lower)
    
    # Look for negation before positive or negative words
    has_negation = False
    for i, w in enumerate(words):
        if w in NEGATIONS:
            # Check if immediately following word is positive (e.g. "not friendly" -> Negative)
            if i + 1 < len(words) and words[i + 1] in POSITIVE_WORDS:
                return "Negative"
            has_negation = True
            
    # Specific negative words
    for w in words:
        if w in NEGATIVE_WORDS:
            if has_negation and w in {"fail", "problem", "issue", "delay"}:
                return "Positive"  # e.g. "without fail", "no problem", "no delay"
            return "Negative"
            
    # Specific positive words
    for w in words:
        if w in POSITIVE_WORDS:
            return "Positive" if not has_negation else "Negative"
            
    return "Neutral"


def analyze_hotel_review_aspects(review_text: str, overall_sentiment: str = "Positive") -> Dict[str, Any]:
    """
    Executes Aspect-Based Sentiment Analysis on a hotel review.
    """
    clean_text = review_text.strip() if review_text else ""
    if not clean_text:
        return {
            "aspects": [],
            "positive_aspects": [],
            "negative_aspects": [],
            "neutral_aspects": [],
            "summary": "No customer feedback text was provided for aspect analysis.",
            "positive_feedback": [],
            "negative_feedback": [],
            "management_insight": "Provide detailed guest feedback to generate operational insights."
        }

    clauses = split_into_clauses(clean_text)
    detected_aspects = []
    seen_aspect_names = set()

    for clause in clauses:
        clause_lower = clause.lower()
        matched_aspect = None
        
        # Match against our catalog ordered by priority
        for aspect_def in sorted(ASPECT_CATALOG, key=lambda x: x["priority"], reverse=True):
            name = aspect_def["aspect"]
            if name in seen_aspect_names:
                continue
                
            is_match = False
            for pat in aspect_def["patterns"]:
                if re.search(pat, clause_lower):
                    is_match = True
                    break
                    
            if not is_match:
                ctx = aspect_def.get("context_terms", [])
                triggers = aspect_def.get("sentiment_triggers", [])
                if ctx and triggers:
                    has_ctx = any(c in clause_lower for c in ctx)
                    has_trig = any(t in clause_lower for t in triggers)
                    if has_ctx and has_trig:
                        is_match = True

            # Special case for "comfortable" without repeating "room"
            if not is_match and name == "Room Comfort" and re.search(r'\b(?:un)?comfortable\b', clause_lower):
                is_match = True

            if is_match:
                matched_aspect = aspect_def
                break
                
        if matched_aspect:
            name = matched_aspect["aspect"]
            seen_aspect_names.add(name)
            
            # Find sentiment
            sentiment = evaluate_clause_sentiment(clause, matched_aspect)
            
            # Extract evidence verbatim from review
            evidence = clause.strip(" ,;.")
            for prefix in ["but ", "and ", "yet ", "however ", "although ", "also "]:
                if evidence.lower().startswith(prefix):
                    evidence = evidence[len(prefix):].strip()
                    
            detected_aspects.append({
                "aspect": name,
                "sentiment": sentiment,
                "evidence": evidence,
                "positive_feedback": matched_aspect["positive_feedback"],
                "negative_feedback": matched_aspect["negative_feedback"],
                "management_positive": matched_aspect["management_positive"],
                "management_negative": matched_aspect["management_negative"],
            })

    # Group aspects by sentiment
    positive_aspects = [a for a in detected_aspects if a["sentiment"] == "Positive"]
    negative_aspects = [a for a in detected_aspects if a["sentiment"] == "Negative"]
    neutral_aspects = [a for a in detected_aspects if a["sentiment"] == "Neutral"]

    # Generate Positive and Negative Feedback Bullets
    positive_bullets = [a["positive_feedback"] for a in positive_aspects]
    negative_bullets = [a["negative_feedback"] for a in negative_aspects]

    # Generate Human-Readable Summary
    pos_names = [a["aspect"].lower() for a in positive_aspects]
    neg_names = [a["aspect"].lower() for a in negative_aspects]

    def format_list(items: List[str]) -> str:
        if not items:
            return ""
        if len(items) == 1:
            return items[0]
        if len(items) == 2:
            return f"{items[0]} and {items[1]}"
        return f"{', '.join(items[:-1])}, and {items[-1]}"

    if positive_aspects and negative_aspects:
        summary = (
            f"Overall, the review is classified as {overall_sentiment} because the customer expressed dissatisfaction with "
            f"{format_list(neg_names)}. However, the customer was positive about {format_list(pos_names)}."
        )
    elif negative_aspects:
        summary = (
            f"Overall, the review is classified as {overall_sentiment} because the customer experienced critical issues "
            f"regarding {format_list(neg_names)}."
        )
    elif positive_aspects:
        summary = (
            f"Overall, the review is classified as {overall_sentiment} because the customer expressed high satisfaction "
            f"regarding {format_list(pos_names)}."
        )
    else:
        summary = (
            f"Overall, the review is classified as {overall_sentiment} based on the general sentiment indicators in the text."
        )

    # Generate Hotel Management Insight
    if negative_aspects and positive_aspects:
        neg_focus = [a["management_negative"] for a in negative_aspects]
        pos_focus = [a["management_positive"] for a in positive_aspects]
        management_insight = (
            f"Management should focus on improving {format_list(neg_focus)}. "
            f"Meanwhile, {format_list(pos_focus)} were viewed positively and should be maintained."
        )
    elif negative_aspects:
        neg_focus = [a["management_negative"] for a in negative_aspects]
        management_insight = (
            f"Management should prioritize immediate corrective action on {format_list(neg_focus)}."
        )
    elif positive_aspects:
        pos_focus = [a["management_positive"] for a in positive_aspects]
        management_insight = (
            f"Guest commendations highlight strong operational performance in {format_list(pos_focus)}. Maintain these high standards."
        )
    else:
        management_insight = "Continue monitoring guest feedback across core service and accommodation touchpoints."

    # Final public aspects payload
    aspects_payload = [
        {
            "aspect": a["aspect"],
            "sentiment": a["sentiment"],
            "evidence": a["evidence"],
        }
        for a in detected_aspects
    ]

    return {
        "aspects": aspects_payload,
        "positive_aspects": [a["aspect"] for a in positive_aspects],
        "negative_aspects": [a["aspect"] for a in negative_aspects],
        "neutral_aspects": [a["aspect"] for a in neutral_aspects],
        "summary": summary,
        "positive_feedback": positive_bullets,
        "negative_feedback": negative_bullets,
        "management_insight": management_insight,
    }
