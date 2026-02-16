import EmailGate from '../components/EmailGate';
import ProcureAIScrollPresentation from './ProcureAIScrollPresentation';

const ProcureAIScrollPublic = () => {
  return (
    <EmailGate 
      proposalSlug="procure-ai-scroll" 
      proposalTitle="Procure AI - Scroll Presentation"
    >
      <ProcureAIScrollPresentation />
    </EmailGate>
  );
};

export default ProcureAIScrollPublic;
