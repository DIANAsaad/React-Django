from django.apps import apps
from django.http import JsonResponse



def delete_object(request, app_label, model_name, object_id):
    model = apps.get_model(app_label, model_name)
    if model:
        model.objects.get(id=object_id).delete()
        return JsonResponse(
            {"message": f"{model_name} successduly deleted"}, status=200
        )
    return JsonResponse({"message": f"{model_name} not found"}, status=404)

def delete_object_by_condition(request, app_label, model_name, **condition):
     model = apps.get_model(app_label, model_name)
     if model:
         model.objects.filter(**condition).delete()
         return JsonResponse(
            {"message": f"{model_name} successduly deleted"}, status=200
        )
     return JsonResponse({"message": f"{model_name} not found"}, status=404)