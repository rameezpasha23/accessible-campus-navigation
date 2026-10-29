# CampusPath — Accessible Campus Navigation Assistant

A responsive hackathon MVP built with HTML, CSS, JavaScript, Leaflet and OpenStreetMap.

## Features included
- Interactive map with sample campus place markers
- Search by name, category, or description
- Category filters for academic buildings, facilities, and offices
- Route planner using a small demo campus-path graph
- Accessibility mode that filters paths marked accessible in the demo data
- Optional browser geolocation
- Responsive layout for desktop and mobile

## Run locally
1. Extract the ZIP file.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Keep an internet connection active for map tiles, Leaflet, and Google Fonts.

You can also serve the folder with Python:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Important: replace demo data before presenting as real navigation
The coordinates in `app.js` are sample coordinates, not verified locations inside Navodaya Institute of Technology or any other campus. The route graph is also demo data and does not represent surveyed paths. Do not claim a route is wheelchair-accessible unless the entrance, surface, slope, curb cuts, width, and other relevant accessibility details have been checked.

### Customize locations
Edit the `places` array near the top of `app.js`. Each place has:
- `id`: unique ID
- `name`: place name
- `category`: `Academic`, `Facilities`, or `Office`
- `description`: short description
- `lat` and `lng`: verified GPS coordinates
- `accessible`: whether accessibility information is verified for that location

Edit the `paths` array to add paths between places. Set `accessible: true` only for a path that has actually been checked.

## Suggested next development steps
1. Collect the campus building coordinates and path connections.
2. Add an admin page to manage locations.
3. Store locations and paths in a database/API.
4. Replace the demo graph with real pedestrian routing based on mapped campus paths.
5. Add route details, floor information, and obstacle reporting.

## External services
- Leaflet: https://leafletjs.com/
- OpenStreetMap: https://www.openstreetmap.org/
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
