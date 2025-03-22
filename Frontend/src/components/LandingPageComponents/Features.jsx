import { useState } from "react";
import gsap from "gsap";
import "../../styles/Features.css";
import { FaExpand } from 'react-icons/fa';
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import featuresData from "../../constants/featureConstants";

export default function Features() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      gsap.fromTo(
        `.feature-card-${id}`,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1,translateY : 0, duration: 0.5, ease: "power3.out" }
      );
    }
  };

  return (
    <section className="features-section" id="features">
      <div className="background-text">Service</div>
      <h2 className="features-title">Services we offer</h2>
      <div className="features-container">
        {featuresData.map((feature ) => (
          <div
            key={feature.id}
            className={`flex-column feature-card feature-card-${feature.id} ${expandedId === feature.id ? "expanded" : ""} ${expandedId && expandedId !== feature.id ? "hidden" : ""}`}
          >
            <h3>{feature.title}</h3>
            <p>{expandedId === feature.id ? feature.details : feature.shortDesc}</p>
            <button onClick={() => toggleExpand(feature.id)} className="expand-btn center">
              {expandedId === feature.id ? <RiCollapseDiagonal2Line /> : <FaExpand />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
