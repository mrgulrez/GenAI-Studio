import { CardTitle, Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from 'next/image';

const testimonials = [
  {
    name: "Alice Johnson",
    avatar: "/images/testimonial1.png",
    title: "CEO, Tech Innovators Inc.",
    description:
      "Working with this team has been an absolute pleasure. Their innovative approach and dedication to excellence truly set them apart. I highly recommend their services to anyone looking to take their business to the next level.",
  },
  {
    name: "Michael Smith",
    avatar: "/images/testimonial3.png",
    title: "CTO, Future Enterprises",
    description:
      "The expertise and support provided by the team were invaluable. Their technical knowledge and ability to solve complex problems made our collaboration smooth and successful.",
  },
  {
    name: "Sara Williams",
    avatar: "/images/testimonial2.png",
    title: "Founder, Creative Solutions",
    description:
      "Their creativity and attention to detail exceeded my expectations. The final product was not only visually stunning but also highly functional. I couldn't be happier with the outcome.",
  },
  {
    name: "David Brown",
    avatar: "/images/testimonial4.png",
    title: "COO, Global Tech Partners",
    description:
      "Their professionalism and commitment to delivering top-quality results were evident from day one. The team’s work has significantly impacted our operations, driving efficiency and growth.",
  },
];


export const LandingContent = () => {
  return (
    <div className="px-10 pb-20">
      <h2 className="text-center text-4xl text-white font-extrabold mb-10">
        Testimonials
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testimonials.map((item, index) => (
          <Card key={index} className="bg-[#192339] border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div className="relative w-10 h-10">
                  <Image 
                    src={item.avatar} 
                    alt={`${item.name}'s avatar`} 
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-lg">{item.name}</p>
                  <p className="text-zinc-400 text-sm">{item.title}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-2">
              <p className="text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
