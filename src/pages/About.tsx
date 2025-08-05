import ProfileCard from '../components/ProfileCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  const creativeDirectors = [
    {
      name: "Ramalingam S",
      role: "Founder & CEO",
      description: "Visionary leader with expertise in creative strategy and team management. John drives our creative vision and ensures every project exceeds expectations.",
      image: "/images/70e15dfc-5138-423b-82f9-9f4cfccffdb0.png"
    },
    {
      name: "Suresh Victor",
      role: "Co-Founder & CPO",
      description: "Award-winning creative professional with a passion for innovative storytelling. Fabian leads our creative team in developing compelling visual narratives.",
      image: "/images/daae1eb5-606b-4633-8c06-8837a4b9ea0c.png"
    }
  ];

  const teamMembers = [
    {
      name: "Sandeep Mayura",
      role: "Director Engineering",
      description: "13+ years in software industry AWS Certified Solutions Architect. Senior Software Architect with deep expertise in cloud infrastructure, DevOps, and backend systems (Rust/Actix, RPNP, MongoDB). Founding member and first employee at CoinDCX; served as Principal Engineer driving scalable fintech architecture.",
      image: "/images/3eb29e9b-aed7-4ca4-b680-a4aaa35303d5.png"
    },
    {
      name: "Sushovan Das",
      role: "Director Engineering",
      description: "Founder & Mobile Engineering Expert with startup exit experience. Built mobile-first platforms at CoinDCX serving 10M+ users. Expert in Android, iOS, Flutter, NodeJS, React Native, high-performance UX. Led teams solving complex user experience.",
      image: "/images/eebe95d0-92aa-414c-a283-4f1432e522d4.png"
    },
    {
      name: "Victor Salomon",
      role: "Product Manager",
      description: "6+ years leading product at health-tech, e-commerce, and Al platforms. Founded Peersclub (matchmaking platform with Al-driven onboarding). Expert in user research, product-market fit, and Al integration. Proven track record in 0-to-1 product.",
      image: "/images/7b19326d-977d-48c0-b45a-dd4be7e934b3.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/*Header*/}
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're a passionate team of innovators, creators, and problem-solvers dedicated to 
            building exceptional digital experiences that make a difference in people's lives.
          </p>
        </div>
      </div>

      {/* Leaders Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Leaders</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Ramalingam Card */}
            <div className="bg-card rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-border hover:scale-105 transform transition-transform">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex-shrink-0">
                  <img
                    src={creativeDirectors[0].image}
                    alt={creativeDirectors[0].name}
                    className="w-32 h-40 object-cover rounded-lg border-4 border-primary/10"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">{creativeDirectors[0].name}</h3>
                  <p className="text-lg text-primary font-semibold">{creativeDirectors[0].role}</p>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      <span className="font-bold">15+ years</span> in fintech, growth strategy, and brand building
                    </p>
                    <p className="text-muted-foreground">
                      Scaled <span className="font-bold">CoinDCX</span> to India's first crypto unicorn as <span className="font-bold">Marketing Head</span>
                    </p>
                    <p className="text-muted-foreground">
                      Led growth at <span className="font-bold">Tap Invest</span> and <span className="font-bold">BigMyGig (65K+)</span> users
                    </p>
                    <p className="text-muted-foreground">
                      Building <span className="font-bold">AssetWorks</span> to democratize investment intelligence globally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suresh Victor Card */}
            <div className="bg-card rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-border hover:scale-105 transform transition-transform">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex-shrink-0">
                  <img
                    src={creativeDirectors[1].image}
                    alt={creativeDirectors[1].name}
                    className="w-32 h-40 object-cover rounded-lg border-4 border-primary/10"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">{creativeDirectors[1].name}</h3>
                  <p className="text-lg text-primary font-semibold">{creativeDirectors[1].role}</p>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      <span className="font-bold">12+ years</span> building scalable products at <span className="font-bold">Captain Fresh</span>, <span className="font-bold">CoinDCX</span>
                    </p>
                    <p className="text-muted-foreground">
                      Led product teams at <span className="font-bold">IPO-bound companies</span>
                    </p>
                    <p className="text-muted-foreground">
                      Expert in Al/ML integration and platform architecture
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-bold">NIT alumnus</span>, leads product
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The talented individuals who bring our vision to life every day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <ProfileCard key={index} {...member} />
            ))}
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-8">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              To empower businesses and individuals through innovative technology solutions that 
              simplify complex challenges and unlock new possibilities for growth and success.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
                <p className="text-muted-foreground">Pushing boundaries with cutting-edge solutions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Collaboration</h3>
                <p className="text-muted-foreground">Working together to achieve extraordinary results</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
                <p className="text-muted-foreground">Delivering quality that exceeds expectations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*Footer*/}
      <Footer />
    </div>
  );
};

export default About;
