"use client";

import { useEffect, useMemo, useRef } from "react";
import { JobResult } from "@/types";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with bundlers
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface JobMapProps {
    jobs: JobResult[];
    shortlistedIds: Set<string>;
    onShortlist: (job: JobResult) => void;
}

// Auto-fit map bounds to markers
function FitBounds({ jobs }: { jobs: JobResult[] }) {
    const map = useMap();
    const prevBoundsRef = useRef<string>("");

    const geoJobs = useMemo(
        () => jobs.filter((j) => j.latitude && j.longitude),
        [jobs]
    );

    useEffect(() => {
        if (geoJobs.length === 0) return;

        const boundsKey = geoJobs
            .map((j) => `${j.latitude},${j.longitude}`)
            .join("|");

        if (boundsKey === prevBoundsRef.current) return;
        prevBoundsRef.current = boundsKey;

        const bounds = L.latLngBounds(
            geoJobs.map((j) => [j.latitude!, j.longitude!] as L.LatLngTuple)
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }, [geoJobs, map]);

    return null;
}

export default function JobMap({
    jobs,
    shortlistedIds,
    onShortlist,
}: JobMapProps) {
    const geoJobs = useMemo(
        () => jobs.filter((j) => j.latitude && j.longitude),
        [jobs]
    );

    if (geoJobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
                    <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-1">
                    No location data available
                </p>
                <p className="text-sm text-slate-400">
                    Jobs without location coordinates can't be shown on the map
                </p>
            </div>
        );
    }

    const center: L.LatLngTuple = [geoJobs[0].latitude!, geoJobs[0].longitude!];

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg animate-fade-in">
            <MapContainer
                center={center}
                zoom={4}
                style={{ height: "550px", width: "100%" }}
                scrollWheelZoom={true}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds jobs={jobs} />
                {geoJobs.map((job, index) => {
                    const jobKey = `${job.jobTitle}-${job.companyName}`;
                    const isShortlisted = shortlistedIds.has(jobKey);

                    return (
                        <Marker
                            key={index}
                            position={[job.latitude!, job.longitude!]}
                        >
                            <Popup
                                maxWidth={300}
                                minWidth={260}
                                className="job-map-popup"
                            >
                                <div className="p-1">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                            {job.companyImage &&
                                                !job.companyImage.includes(
                                                    "placeholder"
                                                ) ? (
                                                <img
                                                    src={job.companyImage}
                                                    alt={job.companyName}
                                                    className="w-full h-full object-contain p-0.5"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-base font-bold text-slate-400">
                                                    {job.companyName[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    color: "#1e293b",
                                                    lineHeight: "1.3",
                                                    margin: "0 0 2px 0",
                                                }}
                                            >
                                                {job.jobTitle}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#94a3b8",
                                                    margin: 0,
                                                }}
                                            >
                                                {job.companyName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    {job.location && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                fontSize: "11px",
                                                color: "#64748b",
                                                marginBottom: "12px",
                                            }}
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            {job.location}
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                        }}
                                    >
                                        <button
                                            onClick={() => onShortlist(job)}
                                            disabled={isShortlisted}
                                            style={{
                                                flex: 1,
                                                padding: "7px 10px",
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                border: isShortlisted
                                                    ? "1px solid #bbf7d0"
                                                    : "1px solid #bfdbfe",
                                                background: isShortlisted
                                                    ? "#f0fdf4"
                                                    : "#eff6ff",
                                                color: isShortlisted
                                                    ? "#16a34a"
                                                    : "#2563eb",
                                                cursor: isShortlisted
                                                    ? "default"
                                                    : "pointer",
                                                fontFamily:
                                                    "'Sora', sans-serif",
                                            }}
                                        >
                                            {isShortlisted
                                                ? "✓ Shortlisted"
                                                : "Shortlist"}
                                        </button>
                                        <a
                                            href={job.applicationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                padding: "7px 10px",
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                background:
                                                    "linear-gradient(135deg, #f43f5e, #ec4899)",
                                                color: "#fff",
                                                textAlign: "center",
                                                textDecoration: "none",
                                                fontFamily:
                                                    "'Sora', sans-serif",
                                            }}
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
            {/* Map footer info */}
            <div className="bg-slate-50 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                    Showing{" "}
                    <strong className="text-slate-700">
                        {geoJobs.length}
                    </strong>{" "}
                    of {jobs.length} jobs on map
                </span>
                <span className="text-slate-400">
                    © OpenStreetMap contributors
                </span>
            </div>
        </div>
    );
}
