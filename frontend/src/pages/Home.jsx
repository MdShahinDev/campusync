
import BorrowFlow from '../components/BorrowFlow'
import CTA from '../components/CTA'
import { FAQSection } from '../components/FAQSection'
import Features from '../components/Features'
import HeroSection from '../components/HeroSection'
import HomeState from '../components/HomeState'
import Mission from '../components/Mission'
import { ProblemSolutionSection } from '../components/ProblemSolutionSection'
import UniversitiesCourses from '../components/UniversitiesCourses'
import UserRoles from '../components/UserRoles'

const Home = () => {
  return (
    <div className='font-inter'>
      <HeroSection/>

      <HomeState/>
      <Mission/>
      {/* <ProblemSolutionSection/> */}
      <Features/>
      <BorrowFlow/>
      <UserRoles/>
      <UniversitiesCourses/>
      <FAQSection/>
      <CTA/>
    </div>
  )
}

export default Home
