
import { ComparisonSection } from '../components/ComparisonSection'
import { FAQSection } from '../components/FAQSection'
import HeroSection from '../components/HeroSection'
import HomeBentoGridSection from '../components/HomeBentoGridSection'
import HomeState from '../components/HomeState'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { ProblemSolutionSection } from '../components/ProblemSolutionSection'

const Home = () => {
  return (
    <div className=''>
      <HeroSection/>
      <HomeState/>
      <ProblemSolutionSection/>
      <HomeBentoGridSection/>
      <HowItWorksSection/>
      <ComparisonSection/>
      <FAQSection/>
    </div>
  )
}

export default Home
