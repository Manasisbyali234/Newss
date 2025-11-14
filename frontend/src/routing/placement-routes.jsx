import { Routes, Route } from "react-router-dom";
import { placement } from "../globals/route-names";
import PlacementDashboard from "../app/pannels/placement/placement-dashboard";
import '../app/pannels/common/modern-dashboard.css';
import '../app/pannels/placement/placement-dashboard.css';

function PlacementRoutes() {
    return (
        <Routes>
            <Route path={placement.INITIAL} element={<PlacementDashboard />} />
            <Route path={placement.DASHBOARD} element={<PlacementDashboard />} />
        </Routes>
    );
}

export default PlacementRoutes;
