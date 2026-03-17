import Hero from '@/components/Hero';
import ProblemAgitate from '@/components/ProblemAgitate';
import ValueStack from '@/components/ValueStack';
import SocialProof from '@/components/SocialProof';
import Transformation from '@/components/Transformation';
import SecondaryCTA from '@/components/SecondaryCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemAgitate />
      <ValueStack />
      <SocialProof />
      <Transformation />
      <SecondaryCTA />
      <Footer />
    </main>
  );
}
