import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DOMParser } from "xmldom";
import * as toGeoJSON from "@tmcw/togeojson";
import * as turf from "@turf/turf";

const KMLViewer = () => {
  const [kmlData, setKmlData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const geoJson = toGeoJSON.kml(xml);
        setKmlData(geoJson);
        setSummary(null);
        setDetails(null);
      };
      reader.readAsText(file);
    }
  };

  const toggleSummary = () => {
    setSummary(
      summary
        ? null
        : (() => {
            if (!kmlData) return null;
            const summaryCounts = {};
            kmlData.features.forEach((feature) => {
              const type = feature.geometry.type;
              summaryCounts[type] = (summaryCounts[type] || 0) + 1;
            });
            return summaryCounts;
          })()
    );
  };

  const toggleDetails = () => {
    setDetails(
      details
        ? null
        : (() => {
            if (!kmlData) return null;
            const detailsData = [];
            kmlData.features.forEach((feature) => {
              if (feature.geometry.type.includes("LineString")) {
                const length = turf.length(feature, { units: "kilometers" });
                detailsData.push({ type: feature.geometry.type, length });
              }
            });
            return detailsData;
          })()
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2>Sample code for OOkul Assesment</h2>
      <p>submission by: ankitbisht9837@gmail.com</p>
      <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">KML Viewer</h2>
        <input
          type="file"
          accept=".kml"
          onChange={handleFileUpload}
          className="mb-4 p-3 w-min-132 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={toggleSummary}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Summary
          </button>
          <button
            onClick={toggleDetails}
            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            Detailed
          </button>
        </div>
        {summary && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-700">Summary</h3>
            <ul className="list-disc list-inside text-gray-600">
              {Object.entries(summary).map(([key, value]) => (
                <li key={key}>{`${key}: ${value}`}</li>
              ))}
            </ul>
          </div>
        )}
        {details && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-700">Details</h3>
            <ul className="list-disc list-inside text-gray-600">
              {details.map((item, index) => (
                <li key={index}>{`${item.type}: ${item.length.toFixed(
                  2
                )} km`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {kmlData && (
        <div className="flex flex-col items-center justify-center mt-6 w-full max-w-4xl h-96 bg-white shadow-lg rounded-lg overflow-hidden">
          <MapContainer center={[20, 78]} zoom={4} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {kmlData.features.map((feature, index) => {
              if (feature.geometry.type === "Point") {
                return (
                  <Marker
                    key={index}
                    position={feature.geometry.coordinates.reverse()}
                  >
                    <Popup>Point</Popup>
                  </Marker>
                );
              } else if (feature.geometry.type.includes("LineString")) {
                return (
                  <Polyline
                    key={index}
                    positions={feature.geometry.coordinates.map((c) => [
                      c[1],
                      c[0],
                    ])}
                    color="blue"
                  />
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default KMLViewer;
