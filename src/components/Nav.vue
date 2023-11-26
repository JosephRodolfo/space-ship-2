<template>
    <div>
      <nav class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/credits">Credits</router-link>
      </nav>
      <router-view></router-view>
    </div>
  </template>
  
  <style>
  .nav-links {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .nav-links a {
    text-decoration: none;
    color: inherit;
  }
  </style>