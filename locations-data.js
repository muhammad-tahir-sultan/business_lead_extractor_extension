// Bundled locations data — Country > Province/State > Cities
// No external CDN needed. Works fully offline inside the Chrome extension.
const LOCATIONS_DATA = {
    "Pakistan": {
        "Punjab": ["Lahore", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Sialkot", "Gujrat", "Sargodha", "Bahawalpur", "Sahiwal", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Okara", "Kasur", "Gujranwala", "Wazirabad", "Mandi Bahauddin", "Khushab", "Pakpattan"],
        "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Badin", "Thatta", "Sanghar", "Umerkot", "Tando Allahyar"],
        "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad", "Mardan", "Mingora", "Kohat", "Nowshera", "Mansehra", "Charsadda", "Bannu", "Dera Ismail Khan", "Swabi", "Haripur", "Battagram", "Dir", "Chitral"],
        "Balochistan": ["Quetta", "Turbat", "Khuzdar", "Hub", "Chaman", "Gwadar", "Dera Murad Jamali", "Kharan", "Nushki", "Panjgur", "Washuk", "Mastung"],
        "Islamabad Capital Territory": ["Islamabad"],
        "Azad Kashmir": ["Muzaffarabad", "Mirpur", "Rawalakot", "Bagh", "Kotli", "Bhimber", "Sudhnoti"],
        "Gilgit-Baltistan": ["Gilgit", "Skardu", "Chilas", "Hunza", "Ghanche", "Astore"]
    },
    "United States": {
        "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Long Beach", "Oakland", "Santa Ana", "Anaheim", "Riverside", "Stockton", "Irvine", "Chula Vista", "Santa Clara"],
        "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "White Plains", "Hempstead", "Troy", "Niagara Falls", "Binghamton"],
        "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Irving", "Garland", "Amarillo", "Frisco"],
        "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines", "Hollywood", "Gainesville", "Miramar", "Coral Springs"],
        "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign", "Waukegan", "Cicero", "Bloomington", "Arlington Heights", "Evanston", "Decatur"],
        "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Spokane Valley", "Kirkland", "Bellingham", "Kennewick", "Yakima", "Redmond", "Marysville"],
        "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise", "Yuma", "Avondale", "Goodyear", "Flagstaff", "Buckeye"],
        "Georgia": ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Albany", "Warner Robins", "Johns Creek", "Alpharetta", "Marietta", "Smyrna", "Valdosta"],
        "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Boulder", "Highlands Ranch", "Greeley", "Longmont", "Loveland", "Castle Rock"],
        "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Elko", "Enterprise", "Spring Valley", "Sunrise Manor", "Paradise", "Whitney", "Summerlin", "Boulder City"]
    },
    "United Kingdom": {
        "England": ["London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Bristol", "Liverpool", "Newcastle", "Nottingham", "Southampton", "Leicester", "Coventry", "Bradford", "Oxford", "Cambridge", "York", "Derby", "Exeter", "Brighton", "Portsmouth"],
        "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling", "Perth", "Livingston", "East Kilbride", "Paisley", "Kilmarnock", "Hamilton", "Dunfermline", "Ayr", "Cumbernauld"],
        "Wales": ["Cardiff", "Swansea", "Newport", "Bangor", "St Davids", "Wrexham", "Barry", "Neath", "Bridgend", "Cwmbran", "Llanelli", "Merthyr Tydfil", "Rhondda", "Aberystwyth", "Caernarfon"],
        "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Ballymena", "Coleraine", "Newtownabbey", "Newtownards", "Omagh", "Bangor", "Antrim", "Larne", "Limavady", "Londonderry"]
    },
    "Germany": {
        "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen", "Bayreuth", "Bamberg", "Landshut", "Rosenheim", "Kempten", "Neu-Ulm", "Passau"],
        "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Gelsenkirchen", "Krefeld", "Aachen", "Oberhausen", "Hamm"],
        "Hamburg": ["Hamburg"],
        "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg", "Heilbronn", "Ulm", "Pforzheim", "Reutlingen", "Esslingen", "Ludwigsburg", "Tübingen", "Villingen-Schwenningen"],
        "Berlin": ["Berlin"],
        "Saxony": ["Leipzig", "Dresden", "Chemnitz", "Zwickau", "Erfurt", "Magdeburg", "Halle", "Rostock", "Potsdam"],
        "Hesse": ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach", "Hanau", "Gießen", "Marburg", "Fulda", "Rüsselsheim"],
        "Lower Saxony": ["Hanover", "Brunswick", "Osnabrück", "Oldenburg", "Wolfsburg", "Göttingen", "Hildesheim", "Salzgitter", "Delmenhorst", "Lüneburg"]
    },
    "United Arab Emirates": {
        "Dubai": ["Dubai", "Deira", "Bur Dubai", "Jumeirah", "Business Bay", "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "Al Quoz", "Dubai Silicon Oasis", "Dubai Internet City", "JLT", "Al Barsha", "Mirdif", "Dubai Hills"],
        "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Khalifa City", "Musaffah", "Yas Island", "Al Reem Island", "Saadiyat Island", "Al Maryah Island", "Madinat Zayed", "Liwa"],
        "Sharjah": ["Sharjah", "Khor Fakkan", "Kalba", "Dibba Al Hisn", "Dhaid"],
        "Ajman": ["Ajman"],
        "Ras Al Khaimah": ["Ras Al Khaimah", "Al Hamra", "Khuzam", "Ghalilah"],
        "Fujairah": ["Fujairah", "Dibba Al Fujairah", "Kalba", "Khor Fakkan"],
        "Umm Al Quwain": ["Umm Al Quwain"]
    },
    "Canada": {
        "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor", "Oakville", "Richmond Hill", "Burlington", "Oshawa", "Sudbury"],
        "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Kelowna", "Abbotsford", "Coquitlam", "Langley", "Saanich", "Delta", "North Vancouver", "Kamloops", "Nanaimo", "Prince George", "Chilliwack"],
        "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Leduc", "Fort McMurray", "Sherwood Park"],
        "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne", "Saint-Jean-sur-Richelieu", "Repentigny"],
        "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],
        "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Lloydminster", "Swift Current"]
    },
    "Australia": {
        "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Wagga Wagga", "Coffs Harbour", "Albury", "Maitland", "Port Macquarie", "Tamworth", "Orange", "Dubbo", "Lismore", "Ballina"],
        "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Melton", "Mildura", "Wodonga", "Warnambool", "Traralgon", "Morwell", "Horsham", "Sale", "Bairnsdale"],
        "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay", "Gladstone", "Maryborough", "Ipswich"],
        "Western Australia": ["Perth", "Mandurah", "Bunbury", "Geraldton", "Kalgoorlie", "Albany", "Broome", "Karratha", "Port Hedland", "Esperance", "Joondalup", "Rockingham"],
        "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Augusta", "Port Pirie", "Victor Harbor", "Gawler", "Port Lincoln"],
        "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "Queenstown"],
        "Australian Capital Territory": ["Canberra"]
    },
    "India": {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Thane", "Navi Mumbai", "Sangli", "Malegaon", "Latur", "Akola", "Jalgaon"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Dharwad", "Mangaluru", "Belgaum", "Davangere", "Ballari", "Tumkur", "Raichur", "Bidar", "Vijayapura", "Shimoga", "Gulbarga"],
        "Delhi": ["New Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad", "Greater Noida", "Dwarka", "Rohini", "Pitampura", "Lajpat Nagar"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Noida", "Saharanpur", "Gorakhpur"]
    },
    "Singapore": {
        "Singapore": ["Singapore", "Orchard", "Marina Bay", "Jurong", "Tampines", "Woodlands", "Punggol", "Sengkang", "Bukit Timah", "Toa Payoh", "Ang Mo Kio", "Bedok", "Clementi", "Bishan", "Queenstown"]
    },
    "Saudi Arabia": {
        "Riyadh Region": ["Riyadh", "Al Kharj", "Dawadmi", "Afif", "Zulfi", "Al Majma'ah"],
        "Makkah Region": ["Jeddah", "Mecca", "Taif", "Yanbu", "Al Qunfudhah", "Rabigh"],
        "Eastern Province": ["Dammam", "Al Khobar", "Dhahran", "Al Ahsa", "Jubail", "Hafr Al-Batin", "Qatif"],
        "Medina Region": ["Medina", "Al Ula", "Khaybar", "Yanbu Al Bahr"],
        "Asir Region": ["Abha", "Khamis Mushait", "Bisha", "Sarat Abidah"]
    }
};
