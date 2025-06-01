export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleString('fr-FR', { month: 'short' }),
    time: date.toLocaleString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
};

export const formatDateForFeatured = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
};

export const isUpcomingEvent = (dateString: string) => {
  return new Date(dateString) > new Date();
};
