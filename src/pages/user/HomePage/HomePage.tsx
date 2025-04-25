import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PartyPopper,
  Calendar,
  Music,
  Wheat,
  Users,
  Camera,
} from "lucide-react";
import "./HomePage.scss";
import axiosInstance from "../../../config/axiosConfig";

interface ILocation {
  _id?: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

interface IProvider {
  _id?: string;
  name: string;
  company: string;
  contact: number;
  locations: ILocation[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

interface ICategory {
  _id?: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
}

interface IProductNew {
  _id?: string;
  name: string;
  description: string;
  categoryId: ICategory;
  providerId: IProvider;
  images: string[];
  price: number;
  datesAvailable: Date[];
  isActive: boolean;
}

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HomePage: React.FC = () => {
  const [latestProducts, setLatestProducts] = useState<IProductNew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/product/all-products");
        const sortedProducts = response.data.data
          .filter((product: IProductNew) => product.isActive)
          .sort((a: IProductNew, b: IProductNew) => {
            return (
              new Date(b.datesAvailable[0]).getTime() -
              new Date(a.datesAvailable[0]).getTime()
            );
          })
          .slice(0, 5);

        setLatestProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
        console.error("Error fetching products:", err);
      }
    };

    fetchLatestProducts();
  }, []);

  const services: ServiceItem[] = [
    {
      icon: <PartyPopper size={48} />,
      title: "Event Planning",
      description:
        "Complete event planning services from concept to execution, ensuring your vision comes to life.",
    },
    {
      icon: <Calendar size={48} />,
      title: "Venue Selection",
      description:
        "Access to exclusive venues tailored to your event size, theme, and budget requirements.",
    },
    {
      icon: <Music size={48} />,
      title: "Entertainment",
      description:
        "Premium entertainment options including DJs, live bands, performers, and more.",
    },
    {
      icon: <Wheat size={48} />,
      title: "Catering",
      description:
        "Exceptional food and beverage services with customizable menus for any dietary requirement.",
    },
    {
      icon: <Users size={48} />,
      title: "Staff Management",
      description:
        "Professional event staff including coordinators, servers, security, and technical support.",
    },
    {
      icon: <Camera size={48} />,
      title: "Photography & Video",
      description:
        "High-quality photography and videography to capture every important moment.",
    },
  ];

  return (
    <div className="home-page">
      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-content">
          <h1>Let's get the party started with us</h1>
          <button
            className="shop-now-btn"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="latest-products-section">
        <h2 className="section-title">Our Latest Offerings</h2>

        {loading ? (
          <div className="products-grid">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="product-skeleton-card">
                <div className="product-skeleton-image shimmer-effect"></div>
                <div className="product-skeleton-info">
                  <div className="skeleton-title shimmer-effect"></div>
                  <div className="skeleton-category shimmer-effect"></div>
                  <div className="skeleton-description shimmer-effect"></div>
                  <div className="skeleton-description-2 shimmer-effect"></div>
                  <div className="skeleton-footer">
                    <div className="skeleton-price shimmer-effect"></div>
                    <div className="skeleton-button shimmer-effect"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="products-grid">
            {latestProducts.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">No Image Available</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.categoryId.name}</p>
                  <p className="product-description">
                    {product.description.length > 120
                      ? `${product.description.substring(0, 120)}...`
                      : product.description}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="view-details-btn"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-all-container">
          <Link to="/products" className="view-all-btn">
            View All Products
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2 className="section-title">Our Services</h2>
        <p className="services-subtitle">
          We provide comprehensive event management services to make your
          special occasions memorable
        </p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
