import { translations } from './translations';
import type { Artisan, Volunteer, Project, Product } from '../types';

// New image URLs provided by the user
const newImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6kaGFdq7VUXUQlDXz5UI5--6dfQW76OX3Bw&s',
    'https://images.hindustantimes.com/rf/image_size_630x354/HT/p2/2020/05/20/Pictures/_10059fa6-9a46-11ea-b5cf-22f71a9413fe.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwFtGM9yvqXs3horfgXSPe4EiOSGi_BxuJEA&s',
];

// Helper to get a deterministic "random" image based on an ID
const getRandomImage = (id: string | number): string => {
    // Simple hash to get a number from a string
    const numId = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
    return newImages[numId % newImages.length];
};

// New profile image URLs provided by the user
const profileImages = [
    'https://images.pexels.com/photos/220365/pexels-photo-220365.jpeg',
    'https://images.pexels.com/photos/2026945/pexels-photo-2026945.jpeg',
    'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    'https://images.pexels.com/photos/8078463/pexels-photo-8078463.jpeg',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
];

// Helper to get a deterministic "random" profile image based on an ID
export const getRandomProfileImage = (id: string | number): string => {
    const numId = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
    return profileImages[numId % profileImages.length];
};

export const initialArtisans: Artisan[] = [
    { id: '101', role: 'artisan', name: 'A. Kumar', avatar: getRandomProfileImage('101'), location: translations.en.artisans.kumar.location, bio: translations.en.artisans.kumar.bio, story: translations.en.artisans.kumar.story, storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: '102', role: 'artisan', name: 'Rina S.', avatar: getRandomProfileImage('102'), location: translations.en.artisans.rina.location, bio: translations.en.artisans.rina.bio, story: translations.en.artisans.rina.story, storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: '103', role: 'artisan', name: 'Manish P.', avatar: getRandomProfileImage('103'), location: translations.en.artisans.manish.location, bio: translations.en.artisans.manish.bio, story: translations.en.artisans.manish.story, storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

export const initialVolunteers: Volunteer[] = [
    { id: '1', role: 'volunteer', name: 'Priya Sharma', avatar: getRandomProfileImage('1'), skills: [translations.en.skills.graphicDesign, translations.en.skills.branding], bio: translations.en.volunteer.priya.bio, motivation: translations.en.volunteer.priya.motivation, projectsCompleted: 1, completedProjects: [{ id: '1', projectName: translations.en.volunteer.completed.project2, artisanName: 'Rina S.', artisanAvatar: getRandomProfileImage('102'), certificateText: 'Certificate for Priya Sharma', skills: [translations.en.skills.graphicDesign], 
// FIX: Added missing issuedDate property
issuedDate: '2023-06-15T10:00:00Z' }], testimonials: [{ quote: translations.en.volunteer.priya.testimonial1, artisanName: 'Rina S.', artisanAvatar: getRandomProfileImage('102') }] },
    { id: '2', role: 'volunteer', name: 'Rohan Mehta', avatar: getRandomProfileImage('2'), skills: [translations.en.skills.photography, translations.en.skills.videography, translations.en.skills.photoEditing], bio: translations.en.volunteer.rohan.bio, motivation: translations.en.volunteer.rohan.motivation, projectsCompleted: 2, completedProjects: [{ id: '2', projectName: translations.en.volunteer.completed.project1, artisanName: 'A. Kumar', artisanAvatar: getRandomProfileImage('101'), certificateText: 'Certificate for Rohan Mehta', skills: [translations.en.skills.photography], 
// FIX: Added missing issuedDate property
issuedDate: '2023-05-20T10:00:00Z' }], testimonials: [{ quote: translations.en.volunteer.rohan.testimonial1, artisanName: 'A. Kumar', artisanAvatar: getRandomProfileImage('101') }, { quote: translations.en.volunteer.rohan.testimonial2, artisanName: 'Manish P.', artisanAvatar: getRandomProfileImage('103') }] },
    { id: '3', role: 'volunteer', name: 'Anika Reddy', avatar: getRandomProfileImage('3'), skills: [translations.en.skills.marketing, translations.en.skills.logistics], bio: translations.en.volunteer.anika.bio, motivation: translations.en.volunteer.anika.motivation, projectsCompleted: 0, completedProjects: [], testimonials: [] },
];

export const initialProjects: Project[] = [
    { id: '1', title: translations.en.volunteer.projects.project1.title, description: translations.en.volunteer.projects.project1.description, skillsNeeded: [translations.en.skills.graphicDesign, translations.en.skills.branding], postedBy: 'Rina S.', status: 'Open' },
    { id: '2', title: translations.en.volunteer.projects.project2.title, description: translations.en.volunteer.projects.project2.description, skillsNeeded: [translations.en.skills.photography], postedBy: 'A. Kumar', status: 'In Progress' },
];

export const initialProducts: Product[] = [
    { id: '1', name: translations.en.products.p1.name, description: translations.en.products.p1.description, longDescription: translations.en.products.p1.longDescription, price: 2500, image: getRandomImage('1'), category: translations.en.categories.pottery, artisanId: '101', dateAdded: '2023-10-26T10:00:00Z', certificateId: 'KH-123456', craftTradition: 'Jaipur Blue Pottery', storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: '2', name: translations.en.products.p2.name, description: translations.en.products.p2.description, longDescription: translations.en.products.p2.longDescription, price: 1800, image: getRandomImage('2'), category: translations.en.categories.textiles, artisanId: '102', dateAdded: '2023-10-25T11:00:00Z', certificateId: 'KH-234567', craftTradition: 'Bandhani', storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: '3', name: translations.en.products.p3.name, description: translations.en.products.p3.description, longDescription: translations.en.products.p3.longDescription, price: 3200, image: getRandomImage('3'), category: translations.en.categories.jewelry, artisanId: '103', dateAdded: '2023-10-24T12:00:00Z', certificateId: 'KH-345678', craftTradition: 'Tarakasi', storyVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: '4', name: translations.en.products.p4.name, description: translations.en.products.p4.description, longDescription: translations.en.products.p4.longDescription, price: 4500, image: getRandomImage('4'), category: translations.en.categories.textiles, artisanId: '102', dateAdded: '2023-10-23T13:00:00Z', certificateId: 'KH-456789', craftTradition: 'Ajrakh' },
    { id: '5', name: translations.en.products.p5.name, description: translations.en.products.p5.description, longDescription: translations.en.products.p5.longDescription, price: 950, image: getRandomImage('5'), category: translations.en.categories.pottery, artisanId: '101', dateAdded: '2023-10-22T14:00:00Z', certificateId: 'KH-567890', craftTradition: 'Terracotta' },
    { id: '6', name: translations.en.products.p6.name, description: translations.en.products.p6.description, longDescription: translations.en.products.p6.longDescription, price: 5500, image: getRandomImage('6'), category: translations.en.categories.jewelry, artisanId: '103', dateAdded: '2023-10-21T15:00:00Z', certificateId: 'KH-678901', craftTradition: 'Tarakasi' },
    { id: '7', name: translations.en.products.p7.name, description: translations.en.products.p7.description, longDescription: translations.en.products.p7.longDescription, price: 7200, image: getRandomImage('7'), category: translations.en.categories.paintings, artisanId: '101', dateAdded: '2023-11-01T10:00:00Z', certificateId: 'KH-789012', craftTradition: 'Madhubani' },
    { id: '8', name: translations.en.products.p8.name, description: translations.en.products.p8.description, longDescription: translations.en.products.p8.longDescription, price: 12500, image: getRandomImage('8'), category: translations.en.categories.sarees, artisanId: '102', dateAdded: '2023-11-02T11:00:00Z', certificateId: 'KH-890123', craftTradition: 'Banarasi' },
];