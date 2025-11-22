import NavBar from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Formme</h1>
          <p className="text-lg text-muted-foreground">
            Learn more about our platform and mission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
