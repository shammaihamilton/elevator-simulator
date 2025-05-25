import { useSimulationStore } from "@/store/simulationStore";
import React, { memo, useCallback, useMemo } from "react";
import { RequestStatus } from "@/types/enums";
import TimeDisplay from "../common/TimeDisplay";

interface FloorProps {
  floorNumber: number;
  buildingIndex: number;
  onRequest: (destinationFloorFromButton: number, sourceFloor: number) => void;
}

const floorHeight = 110;

const Floor = React.forwardRef<HTMLDivElement, FloorProps>(
  ({ floorNumber, onRequest, buildingIndex }, ref) => {
    // Access data from the store in a stable way
    const floorStatuses = useSimulationStore((state) => state.floorStatuses);

    // Derive floor status data locally without calling getFloorStatus method
    const floorData = useMemo(() => {
      const key = `${buildingIndex}-${floorNumber}`;
      return (
        floorStatuses[key] || {
          requestStatus: RequestStatus.PENDING_ASSIGNMENT,
          etaSeconds: null,
          isElevatorServicing: false,
        }
      );
    }, [floorStatuses, buildingIndex, floorNumber]);

    const { requestStatus, etaSeconds, isElevatorServicing } = floorData;
    // Memoize the request handler
    const handleRequest = useCallback(() => {
      onRequest(floorNumber, floorNumber);
    }, [onRequest, floorNumber]);

    // Memoize derived values for the UI
    const { backgroundColor, buttonText, buttonColor, isButtonDisabled } =
      useMemo(() => {
        const backgroundColor =
          isElevatorServicing || requestStatus === RequestStatus.IN_TRANSIT
            ? "#D4EFDF" // Green for arrived
            : requestStatus === RequestStatus.WAITING_FOR_PICKUP
            ? "" // Yellow for waiting
            : "transparent"; // Default

        const buttonText =
          isElevatorServicing || requestStatus === RequestStatus.IN_TRANSIT
            ? "Arrived"
            : requestStatus === RequestStatus.WAITING_FOR_PICKUP
            ? "Waiting"
            : "Call";

        const buttonColor =
          isElevatorServicing || requestStatus === RequestStatus.IN_TRANSIT
            ? "#2ECC71" // Green
            : requestStatus === RequestStatus.WAITING_FOR_PICKUP
            ? "#F39C12" // Orange
            : "#3498DB"; // Blue

        const isButtonDisabled =
          requestStatus !== RequestStatus.PENDING_ASSIGNMENT;

        return {
          backgroundColor,
          buttonText,
          buttonColor,
          isButtonDisabled,
        };
      }, [requestStatus, isElevatorServicing]);

    return (
      <div
        className="floor"
        style={{
          height: `${floorHeight}px`,
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 13px",
          backgroundColor,
          transition: "background-color 0.3s ease",
        }}
        ref={ref}
      >
        <span
          style={{
            fontSize: "0.9rem",
            color: "black",
            fontWeight: "500",
            backgroundColor: "lightgray",
            padding: "5px 5px",
            borderRadius: "4px",
          }}
        >
          Floor {floorNumber}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {
          requestStatus === RequestStatus.WAITING_FOR_PICKUP &&
            etaSeconds !== null &&
            etaSeconds > 0 && (
              <span
                style={{
                  position: "relative",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  color: "black",
                  fontWeight: "500",
                  backgroundColor: "lightgray",
                  padding: "5px 5px",
                  borderRadius: "4px",
                }}
              >
                <TimeDisplay milliseconds={etaSeconds} />
              </span>
            )}
          <button
            onClick={handleRequest}
            style={{
              padding: "8px 15px",
              border: "1px solid transparent",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              backgroundColor: buttonColor,
              color: "white",
              transition: "background-color 0.2s, opacity 0.2s",
              opacity: isButtonDisabled ? 0.8 : 1,
              pointerEvents: isButtonDisabled ? "none" : "auto",
            }}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }
);

Floor.displayName = "Floor";
export default memo(Floor);

