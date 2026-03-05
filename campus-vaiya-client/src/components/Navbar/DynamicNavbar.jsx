
const DynamicNavbar = () => {
  const { user } = useContext(AuthContext);
  const { viewMode } = useContext(ModeContext); 

  if (viewMode === 'campus' && user?.institution) {
    return <InstNavbar institution={user.institution} />;
  }

  return <GlobalNavbar />;
};