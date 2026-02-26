import EmailGate from "../components/EmailGate";
import SagicorProgressDashboard from "./SagicorProgressDashboard";

export default function SagicorProgressDashboardPublic() {
  return (
    <EmailGate presentationTitle="Sagicor Progress Dashboard">
      <SagicorProgressDashboard />
    </EmailGate>
  );
}
