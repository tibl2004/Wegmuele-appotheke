import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import EventList from './components/Events/EventList';
import EventDetail from './components/Events/EventDetail';
import Links from './components/Links/Links';
import LoginForm from './components/Login/LoginForm';
import CreateLinks from './components/Links/CreateLinks';
import UeberUns from './components/Infos/UeberUns';
import VorstandForm from './components/Vorstand/VorstandErstellen';
import MeinProfil from './components/Vorstand/MeinProfil';
import Vorstand from './components/Vorstand/Vorstand';
import Home from './components/Landingpage/Home';
import CreateEventForm from './components/Events/CreateEventForm';
import NewsletterForm from './components/Newsletter/NewsletterForm';
import SubscribeForm from './components/Newsletter/SubscribeForm';
import ImportSubscribersTable from './components/Newsletter/ImportSubcribersTable';
import NewsletterSubscribersList from './components/Newsletter/NewsletterSubscribersList';
import CreateBlog from './components/Blogs/CreateBlog';
import FooterCreate from './components/Impressum/FooterCreate';
import Footer from './components/Impressum/Footer';
import Impressum from './components/Impressum/Impressum';
import BlogList from './components/Blogs/BlogsList';
import BlogDetail from './components/Blogs/BlogsDetail';
import SpendenKontakt from './components/Kontakt/SpendenKontakt';
import NotFound from './components/Error/NotFound';
import EventRegistrations from './components/Events/EventRegistrations';
import VorstandPDF from './components/Vorstand/VorstandPDF';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/links" element={<Links />} />
          <Route path="/footer-create" element={<FooterCreate />} />
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/kontakt" element={<SpendenKontakt />} />
          <Route path="/events/:eventId/anmeldungen" element={<EventRegistrations />} />
          <Route path="/vorstandpdf" element={<VorstandPDF />} />

          <Route path="/create-link" element={<CreateLinks />} />
          <Route path="/ueber-uns" element={<UeberUns />} />
          <Route path="/vorstand-erstellen" element={<VorstandForm />} />
          <Route path="/vorstand" element={<Vorstand />} />
          <Route path="/subscribe-form" element={<SubscribeForm />} />
          <Route path="/newsletter-form" element={<NewsletterForm />} />
          <Route path="/newsletter-import" element={<ImportSubscribersTable />} />
          <Route path="/newsletter-subscribers" element={<NewsletterSubscribersList />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/profil" element={<MeinProfil />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/event/create" element={<CreateEventForm />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
