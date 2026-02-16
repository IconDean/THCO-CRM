import EmailGate from '../components/EmailGate';
import ProcureAIExecutivePackV3 from './ProcureAIExecutivePackV3';

const ProcureAIExecutivePackV3Public = () => {
  return (
    <EmailGate 
      proposalSlug="procure-ai-executive-v3" 
      proposalTitle="Executive Pack V3 - IHS Towers"
    >
      <ProcureAIExecutivePackV3 />
    </EmailGate>
  );
};

export default ProcureAIExecutivePackV3Public;
