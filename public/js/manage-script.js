const openEditModel = ()=>{
    const itemId = document.querySelector('[name=id]').value;

    fetch('/edit-item/'+itemId,{
        method:'GET',
    },).then((response) => {
        response.json().then(data=>{
            document.getElementById('food-edit-name').value = data.item.food_name;
            document.getElementById('food-edit-description').value = data.item.food_description;
            document.getElementById('food-edit-category').value = data.item.food_category;
            document.getElementById('food-edit-price').value = data.item.food_price;
            document.getElementById('foodId').value = data.item._id;
            $('#editFoodModel').modal('show');
        });
        
    }).catch(err=>{
        console.log(err);
    });
}; 


const deleteItem = (btn)=>{
    const itemId = document.querySelector('[name=id]').value;
    const currentElement = btn.closest('.food-card');
    
    fetch('/delete-item/'+itemId,{
        method:'DELETE',
    },).then((response) => {
        return response.json();
    }).then(data=>{
        console.log(data);
        currentElement.parentNode.removeChild(currentElement);
    }).catch(err=>{
        console.log(err);
    });
}; 