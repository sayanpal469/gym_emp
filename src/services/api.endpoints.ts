export const APIEndpoints = {
  logIn: '/emp_login.php',
  register: '/member_reg.php',
  forgotPassWord: '/forgot_password.php',
  resetPassWord: '/reset_password.php',
  otpVerify: '/verify_otp.php',
  otpResend: '/resend_otp.php',
  // logout: '/auth/logout',

  offers: '/offer.php',

  attendance: '/employee_attendance.php',
  leave: '/leave_req.php',
  attendanceList: '/emp_attendance.php',
  leaveList: '/leave_request_list.php',
  pt: '/get_pt_subscriptions.php',
  createBmi: '/health.php',
  getBmi: '/get_member_bmi.php',

  // ADMIN Apis
  getAllEmployeeList: '/admin_get_all_active_employees.php',
  subscriptionOverview: '/admin_subscription_overview.php',
  getTodayAttendanceList: '/admin_get_today_attendance.php',
  revenueChart: '/admin_revenue_chart.php',
  allActiveMemberList: '/admin_active_member_list.php',
  getAllOffers: '/offer.php',
  uploadOffer: '/admin_offer_upload.php'



  // address:'/update_member_address.php',
  // getBranches:'/all_branches.php',
  // memberSubscription:'/member_subscription_list.php',

  // getAmenity: 'active_amenity_list.php',
  // bookAmenity: '/book_amenity.php',
  // getPackages: '/get_packages_by_sub_category.php',
  // bookingList: "/booking_list_by_member_id.php",
  // getSubscription:"/active_subs.php",
  // buySubscription:'/subscription.php',
  // subscriptionPayment:'/subscription_payment.php',
  // subscriptionExpiry:'/subs_exp_notf.php',

  // getAllProduct:'/active_product_list.php',
  // buyProduct:'/product_add_to_cart.php',
  // productPayment:'/product-payment-api.php',
  // paymentHistory: '/payment_history.php'
};
