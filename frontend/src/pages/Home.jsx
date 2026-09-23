
import BorrowFlow from '../components/BorrowFlow'
import { ComparisonSection } from '../components/ComparisonSection'
import CTA from '../components/CTA'
import { FAQSection } from '../components/FAQSection'
import Features from '../components/Features'
import HeroSection from '../components/HeroSection'
import HomeBentoGridSection from '../components/HomeBentoGridSection'
import HomeState from '../components/HomeState'
import { HowItWorksSection } from '../components/HowItWorksSection'
import Mission from '../components/Mission'
import { ProblemSolutionSection } from '../components/ProblemSolutionSection'
import UniversitiesCourses from '../components/UniversitiesCourses'
import UserRoles from '../components/UserRoles'

const Home = () => {
  return (
    <div className=''>
      <HeroSection/>

      {/* <HomeState/> */}
      <Mission/>
      <ProblemSolutionSection/>
      <Features/>
      {/* <HomeBentoGridSection/> */}
      {/* <HowItWorksSection/> */}
      {/* <ComparisonSection/> */}
      <BorrowFlow/>
      <UserRoles/>
      <UniversitiesCourses/>
      <FAQSection/>
      <CTA/>
    </div>
  )
}

export default Home
