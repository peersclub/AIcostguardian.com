
interface ProfileCardProps {
  name: string;
  role: string;
  description: string;
  image: string;
}

const ProfileCard = ({ name, role, description, image }: ProfileCardProps) => {
  return (
    <div className="bg-card rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 border border-border">
      <div className="relative mb-6">
        <img
          src={image}
          alt={name}
          className="w-32 h-40 mx-auto object-cover rounded-lg border-4 border-primary/10"
        />
      </div>
      <h3 className="text-2xl font-bold text-card-foreground mb-2">{name}</h3>
      <p className="text-primary font-semibold mb-4">{role}</p>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default ProfileCard;
