import mysql.connector as pro
import random as r

# ADDING FOOD OPTION FOR ADMIN

def add_food(): 
    try:
        d=pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        ser = int(input("Enter the Food ID: "))
        fi = input("Enter the Food name: ")
        fp = int(input("Enter the Price of Food: ")) 
        ft = input("Enter the Food Type: ")
        e.execute("INSERT INTO item (S_no, Food_Item, Prices, Food_Type) VALUES (%s, %s, %s, %s)", (ser, fi, fp, ft))
        d.commit()
        print("NEW FOOD ADDED SUCCESSFULLY")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()


# UPDATING FOOD & PRICE OPTION FOR ADMIN

def update_food():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        print("1. Update food name")
        print("2. Update food price")
        us = int(input("Enter your choice: "))
        if us == 1:
            fnid = int(input("Enter the Food ID whose food name you want to update: "))
            fna = input("Enter the updated Food Name: ")
            e.execute("UPDATE item SET Food_Item=%s WHERE Item_no=%s", (fna, fnid))
        elif us == 2:
            fnic = int(input("Enter the Food ID whose food price you want to update: "))
            fnf = int(input("Enter the updated Food Price: "))
            e.execute("UPDATE item SET Prices=%s WHERE Item_no=%s", (fnf, fnic))
        print("UPDATED SUCCESSFULLY")
        d.commit()
    




    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# DELETING FOOD OPTION FOR ADMIN

def delete_food():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        fidd = int(input("Enter the Food ID you want to delete: "))
        e.execute("DELETE FROM item WHERE Item_no=%s", (fidd,))
        print("YOU HAVE DELETED A FOOD ITEM SUCCESSFULLY")
        d.commit()
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# VIEWING ORDER HISTORY OPTION FOR ADMIN

def view_orders():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        e.execute("SELECT * FROM orders")
        rtt = e.fetchall()
        if rtt:
            print("Details of all orders are:")
            for i in rtt:
                print("********************************************")
                print("Order ID:",i[0])
                print("Food name:", i[1])
                print("Food price:", i[2])
                print("Total price:", i[3])
                print("Phone NO:", i[4])
                print("Address:", i[5])
                print("********************************************")
        else:
            print("No orders found.")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()



def view_waiters():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        e.execute("SELECT * FROM waiter")
        rtw = e.fetchall()
        if rtw:
            print("Details of all waiters are:")
            for i in rtw:
                print("********************************************")
                print("Waiter No:",i[0])
                print("Waiter name:", i[1])
                print("Hours worked:", i[2])
                print("Customer Phone NO:", i[3])
                print("********************************************")
        else:
            print("No waiters found.")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# ADDING WAITER OPTION FOR ADMIN

def add_waiter():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        wno = int(input("Enter the Waiter No: "))
        wname = input("Enter the Waiter Name: ")
        whrs = int(input("Enter the Hours Worked: "))
        wph = int(input("Enter the Customer Phone NO: "))
        e.execute("INSERT INTO waiter (W_no, Waiter_name, Hours_worked, customer_ph_no) VALUES (%s, %s, %s, %s)", (wno, wname, whrs, wph))
        d.commit()
        print("NEW WAITER ADDED SUCCESSFULLY")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# UPDATING WAITER DETAILS OPTION FOR ADMIN

def update_waiter():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        print("1. Update waiter name")
        print("2. Update hours worked")
        print("3. Update customer phone no")
        us = int(input("Enter your choice: "))
        if us == 1:
            wnid = int(input("Enter the Waiter No whose name you want to update: "))
            wna = input("Enter the updated Waiter Name: ")
            e.execute("UPDATE waiter SET Waiter_name=%s WHERE W_no=%s", (wna, wnid))
        elif us == 2:
            wnic = int(input("Enter the Waiter No whose hours worked you want to update: "))
            wnf = int(input("Enter the updated Hours Worked: "))
            e.execute("UPDATE waiter SET Hours_worked=%s WHERE W_no=%s", (wnf, wnic))
        elif us == 3:
            wnip = int(input("Enter the Waiter No whose customer phone no you want to update: "))
            wnp = int(input("Enter the updated Customer Phone NO: "))
            e.execute("UPDATE waiter SET customer_ph_no=%s WHERE W_no=%s", (wnp, wnip))
        print("UPDATED SUCCESSFULLY")
        d.commit()
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# LOGIN OPTION FOR ADMIN

def ad_login():
    while True:
        print("1. Add food")
        print("2. Update food")
        print("3. Delete food")
        print("4. View orders")
        print("5. View waiters")
        print("6. Add waiter")
        print("7. Update waiter")
        print("8. Logout")
        ask = int(input("Enter your choice: "))
        if ask == 1:
            add_food()
        elif ask == 2:
            update_food()
        elif ask == 3:
            delete_food()
        elif ask == 4:
            view_orders()
        elif ask == 5:
            view_waiters()
        elif ask == 6:
            add_waiter()
        elif ask == 7:
            update_waiter()
        elif ask == 8:
            return

# PASSWORD FOR ADMIN TO LOGIN

def ad_panel():
    pas = input("Enter Password: ")
    if pas == 'Zomato':
        print("Access granted")
        ad_login()
    else:
        print("Wrong Password")
        print("You have been redirected to the Main Page")
        admin()

# FOOD ITEMS TO SHOW CUSTOMER

def show_menu():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        e.execute("SELECT * FROM item ORDER BY S_no asc")
        w = e.fetchall()
        print("-------------MENU FOR TODAY-------------")
        for i in w:
            print("Item No.", i[0], "Item Name:", i[1], "-- Price:", i[2], "--Item type:", i[3])
        ui = input("Do you want to order food (Yes/No): ")
        if ui.lower() == "yes":
            F_order()
        else:
            print("Thank you")
            print("You have been redirected to the Main Page")
    

    except pro.Error as err:
        print("Error:",err)
    
    finally:
        e.close()
        d.close()



# TO PLACE ORDER OF FOOD ITEM

import random as r
def F_order():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        io = int(input("Enter the food item no. you want to order: "))
        QTY = int(input("Enter QTY of food: "))
        phn = int(input("Enter your Phone NO: "))
        ADR = input("Enter your Address: ")
        e.execute("SELECT * FROM item WHERE S_no=%s", (io,))
        fi = e.fetchone()
        if fi:
            iname, iprice = fi[1], fi[2]
            oprice = iprice * QTY
            o_id = r.randrange(10000000,99999999)
            e.execute("INSERT INTO orders (Order_ID, O_name, I_price, O_price, P_no, ADR) VALUES (%s, %s, %s, %s, %s, %s)",
                      (o_id, iname, iprice, oprice, phn, ADR))
            d.commit()
            print("********BILL********")
            print("Order ID:",o_id)
            print("Address:", ADR)
            print("Phone NO:", phn)
            print("Food name:", iname)
            print("Food price:", iprice)
            print("QTY of food:", QTY)
            print("Total price:", oprice)
            print("********************")
            print("Thanks for ordering food")
            print("Your order has been confirmed")
        else:
            print("Food item not found.")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()











# VIEWING YOUR FOOD ORDER HISTORY

def F_View():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        yno = int(input("Enter your phone NO: "))
        e.execute("SELECT * FROM orders WHERE P_no=%s", (yno,))
        rt = e.fetchall()
        if rt:
            print("**********YOUR ORDER DETAILS**********")
            for i in rt:
                print("Order ID:",i[0])
                print("Food name:", i[1])
                print("Food price:", i[2])
                print("Total price:", i[3])
                print("Phone NO:", i[4])
                print("Address:", i[5])
        else:
            print("YOU HAVE NOT PLACED ANY ORDER")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# CANCELING YOUR FOOD ORDER

def F_Cancel():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        cor = int(input("Enter your phone NO: "))
        e.execute("DELETE FROM orders WHERE P_no=%s", (cor,))
        d.commit()
        print("Your order has been cancelled SUCCESSFULLY")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()














# FEEDBACK OPTION FOR CUSTOMER

def F_feedb():
    try:
        d = pro.connect(host="localhost", user="root", password="admin", database="food")
        e = d.cursor()
        fdb = int(input("Enter your Phone NO: "))
        print("Give us Feedback--")
        fdc = input(" ")
        fdk=r.randrange(10000000,99999999)
        e.execute("INSERT INTO feed (Feed_no, P_no, F_back) VALUES (%s, %s, %s)", (fdk, fdb, fdc))
        d.commit()
        print("THANKS FOR YOUR FEEDBACK")
    except pro.Error as err:
        print("Error:",err)
    finally:
        e.close()
        d.close()

# MAIN MENU FOR CUSTOMER

def main_menu():
    while True:
        print("----------------------WELCOME TO FOOD PORTAL----------------------")
        print("1. Main Menu")
        print("2. Place your Orders")
        print("3. View order")
        print("4. Cancel your Order")
        print("5. Feedback")
        print("6. Exit")
        a = int(input("Enter the Service you want: "))
        if a == 1:
            show_menu()
        elif a == 2:
            F_order()
        elif a == 3:
            F_View()
        elif a == 4:
            F_Cancel()
        elif a == 5:
            F_feedb()
        elif a == 6:
            break











# HOME PAGE

def admin():
    while True:
        print("********************************************")
        print("WELCOME TO FOOD PORTAL")
        print("1. Admin Login")
        print("2. Customer Login")
        print("3. EXIT")
        op = int(input("Enter option: "))
        if op == 1:
            ad_panel()
        elif op == 2:
            main_menu()
        elif op == 3:
            break

admin()
